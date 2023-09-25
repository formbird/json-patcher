use indexmap::IndexMap;
use json_patch::{AddOperation, PatchOperation, RemoveOperation, ReplaceOperation};
use serde_json::{Map, Value};

pub fn subtract(minuend: &Map<String, Value>, subtrahend: &Map<String, Value>) -> Vec<String> {
    let mut result = Vec::new();

    for (key, _) in minuend.iter().filter(|(_, value)| !value.is_null()) {
        if !subtrahend.contains_key(key) {
            result.push(key.clone());
        }
    }

    result
}

pub fn intersection(objects: &[Map<String, Value>]) -> Vec<String> {
    let length = objects.len();
    // prepare empty counter to keep track of how many objects each key occurred in
    let mut counter: IndexMap<String, i32> = IndexMap::new();
    // go through each object and increment the counter for each key in that object
    for object in objects {
        for (key, _) in object {
            let count = counter.entry(key.to_string()).or_insert(0);
            *count += 1;
        }
    }
    // now delete all keys from the counter that were not seen in every object
    counter.retain(|_, &mut v| v == length as i32);
    // finally, extract whatever keys remain in the counter
    counter.keys().cloned().collect()
}

pub fn diff_any(input: &Value, output: &Value, ptr: &str) -> Vec<PatchOperation> {
    if input == output {
        return Vec::new();
    }

    match (input, output) {
        (Value::Array(input_array), Value::Array(output_array)) => {
            diff_arrays(input_array, output_array, ptr)
        }
        (Value::Object(input_obj), Value::Object(output_obj)) => {
            diff_objects(input_obj, output_obj, ptr)
        }
        _ => {
            vec![PatchOperation::Replace(ReplaceOperation {
                path: ptr.to_string(),
                value: output.clone(),
            })]
        }
    }
}


pub fn diff_objects(
    input: &Map<String, Value>,
    output: &Map<String, Value>,
    ptr: &str,
) -> Vec<PatchOperation> {
    let mut operations = Vec::new();

    for key in subtract(input, output) {
        operations.push(PatchOperation::Remove(RemoveOperation {
            path: format!("{}/{}", ptr, key),
        }));
    }

    for key in subtract(output, input) {
        operations.push(PatchOperation::Add(AddOperation {
            path: format!("{}/{}", ptr, key),
            value: output[&key].clone(),
        }));
    }

    for key in intersection(&[input.clone(), output.clone()]) {
        let key_ptr = format!("{}/{}", ptr, key);
        let key_operations = diff_any(&input[&key], &output[&key], &key_ptr);
        operations.extend(key_operations);
    }

    operations
}

#[derive(Debug, Clone)]
enum Operation {
    Add { index: usize, value: Value },
    Remove { index: usize },
    Replace { index: usize, original: Value, value: Value },
}
impl Operation {
    fn new_add(index: usize, value: Value) -> Self {
        Operation::Add {
            index,
            value,
        }
    }

    fn new_remove(index: usize) -> Self {
        Operation::Remove {
            index,
        }
    }

    fn new_replace(index: usize, original: Value, value: Value) -> Self {
        Operation::Replace {
            index,
            value,
            original
        }
    }
}

fn diff_arrays(input: &[Value], output: &[Value], ptr: &str) -> Vec<PatchOperation> {
    fn dist(
        i: usize,
        j: usize,
        input: &[Value],
        output: &[Value],
        memo: &mut Vec<Vec<Option<Vec<Operation>>>>,
    ) -> Vec<Operation> {
        if let Some(cached) = memo[i][j].as_ref() {
            return cached.clone();
        }

        let result;

        if i > 0 && j > 0 && input[i - 1] == output[j - 1] {
            // Equal elements, no operation needed
            result = dist(i - 1, j - 1, input, output, memo);
        } else {
            let mut alternatives = Vec::new();

            if i > 0 {
                // Remove operation
                let remove = Operation::new_remove(i - 1);
                let mut remove_base = dist(i - 1, j, input, output, memo);
                remove_base.push(remove);
                alternatives.push(remove_base);
            }

            if j > 0 {
                // Add operation
                let add = if i == input.len() {
                    // Append to the end of the array
                    Operation::new_add(input.len(), output[j - 1].clone())
                } else {
                    Operation::new_add(i, output[j - 1].clone())
                };
                let mut add_base = dist(i, j - 1, input, output, memo);
                add_base.push(add);
                alternatives.push(add_base);
            }

            if i > 0 && j > 0 {
                // Replace operation
                let replace = Operation::new_replace(i - 1, input[i - 1].clone(), output[j - 1].clone());
                let mut replace_base = dist(i - 1, j - 1, input, output, memo);
                replace_base.push(replace);
                alternatives.push(replace_base);
            }

            // Find the alternative with the lowest cost
            result = alternatives
                .iter()
                .min_by(|a, b| {
                    let len_a = a.len();
                    let len_b = b.len();
                    len_a.cmp(&len_b)
                })
                .unwrap_or(&Vec::new()) // Default to an empty vector if no valid alternatives
                .clone();
        }

        memo[i][j] = Some(result.clone());
        result
    }

    let mut memo: Vec<Vec<Option<Vec<Operation>>>> = vec![vec![None; output.len() + 1]; input.len() + 1];
    let array_operations = dist(input.len(), output.len(), input, output, &mut memo);

    let (padded_operations, _) = array_operations.into_iter().fold((Vec::new(), 0isize), |(mut operations, padding), array_operation| {
        match array_operation {
            Operation::Add { value, index } => {
                let padded_index = (index as isize) + 1 + padding;
                let index_token = if padded_index < (input.len() as isize + padding) { padded_index.to_string() } else { "-".to_string() };

                operations.push(PatchOperation::Add(AddOperation {
                    path: format!("{}/{}", ptr, index_token),
                    value,
                }));
                (operations, padding + 1)
            },
            Operation::Remove { index } => {
                operations.push(PatchOperation::Remove(RemoveOperation {
                    path: format!("{}/{}", ptr, (index as isize) + padding),
                }));
                (operations, padding - 1)
            },
            Operation::Replace { index, value, original } => {
                let replace_ptr = format!("{}/{}", ptr, (index as isize) + padding);
                let replace_operations = diff_any(&original, &value, &replace_ptr);
                operations.extend(replace_operations);
                (operations, padding)
            }
        }
    });
    padded_operations
}

#[cfg(test)]
mod test {
    use super::diff_any as diff;
    use json_patch::PatchOperation;
    use serde_json::{json};

    #[test]
    fn a_1_adding_an_object_member() {
        let input = json!({
          "foo": "bar"
        });
        let output = json!({
          "baz": "qux",
          "foo": "bar"
        });
        let patch = diff(&input, &output, "");
        let actual = json!([
          {
            "op": "add",
            "path": "/baz",
            "value": "qux"
          }
        ]);
        let actual: Vec<PatchOperation> = serde_json::from_value(actual).unwrap();
        assert_eq!(patch, actual);
    }

    #[test]
    fn a_3_removing_an_object_member() {
        let input = json!({
          "baz": "qux",
          "foo": "bar"
        });
        let output = json!({
          "foo": "bar"
        });
        let patch = diff(&input, &output, "");
        let actual = json!([
          {
            "op": "remove",
            "path": "/baz"
          }
        ]);
        let actual: Vec<PatchOperation> = serde_json::from_value(actual).unwrap();
        assert_eq!(patch, actual);
    }

    #[test]
    fn a_5_replacing_a_value() {
        let input = json!({
          "baz": "qux",
          "foo": "bar"
        });
        let output = json!({
          "baz": "boo",
          "foo": "bar"
        });
        let patch = diff(&input, &output, "");
        let actual = json!([
          {
            "op": "replace",
            "path": "/baz",
            "value": "boo"
          }
        ]);
        let actual: Vec<PatchOperation> = serde_json::from_value(actual).unwrap();
        assert_eq!(patch, actual);
    }


    #[test]
    fn a_10_adding_a_nested_member_object() {
        let input = json!({
          "foo": "bar"
        });
        let output = json!({
          "foo": "bar",
          "child": {
            "grandchild": {}
          }
        });
        let patch = diff(&input, &output, "");
        let actual = json!([
          {
            "op": "add",
            "path": "/child",
            "value": {
              "grandchild": {}
            }
          }
        ]);
        let actual: Vec<PatchOperation> = serde_json::from_value(actual).unwrap();
        assert_eq!(patch, actual);
    }

    #[test]
    fn a_4_removing_an_array_element() {
        let input = json!({
            "foo": [
                "bar",
                "qux",
                "baz"
            ]
        });
        let output = json!({
            "foo": [
                "bar",
                "baz"
            ]
        });
        let actual = json!([
            {
                "op": "replace",
                "path": "/foo/1",
                "value": "baz"
            },
            {
                "op": "remove",
                "path": "/foo/2"
            }
        ]);
        let actual: Vec<PatchOperation> = serde_json::from_value(actual).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn arrays_1() {
        let input = json!(["A", "Z", "Z"]);
        let output = json!(["A"]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
          { "op": "remove", "path": "/1" },
          { "op": "remove", "path": "/1" },
        ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn arrays_2() {
        let input = json!(["A", "B"]);
        let output = json!(["B", "A"]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
            { "op": "replace", "path": "/0", "value": "B" },
            { "op": "replace", "path": "/1", "value": "A" }
        ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn arrays_3() {
        let input = json!([]);
        let output = json!(["B", "A"]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
            { "op": "add", "path": "/0", "value": "B" },
            { "op": "add", "path": "/1", "value": "A" }
        ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn arrays_4() {
        let input = json!(["B", "A", "M"]);
        let output = json!(["M", "A", "A"]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
            { "op": "replace", "path": "/0", "value": "M" },
            { "op": "replace", "path": "/2", "value": "A" }
        ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn arrays_5() {
        let input = json!(["A", "A", "R"]);
        let output = json!([]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
        { "op": "remove", "path": "/0" },
        { "op": "remove", "path": "/0" },
        { "op": "remove", "path": "/0" }
    ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn arrays_6() {
        let input = json!(["A", "B", "C"]);
        let output = json!(["B", "C", "D"]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
        { "op": "replace", "path": "/0", "value": "B" },
        { "op": "replace", "path": "/1", "value": "C" },
        { "op": "replace", "path": "/2", "value": "D" }
    ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn arrays_7() {
        let input = json!(["A", "C"]);
        let output = json!(["A", "B", "C"]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
        { "op": "replace", "path": "/1", "value": "B" },
        { "op": "add", "path": "/2", "value": "C" }
    ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn arrays_8() {
        let input = json!(["A", "B", "C"]);
        let output = json!(["A", "Z"]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
            { "op": "replace", "path": "/1", "value": "Z" },
            { "op": "remove", "path": "/2" },
        ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn handles_objects_with_nulls() {
        let input = json!({"name": "bob", "image": null, "cat": null});
        let output = json!({"name": "bob", "image": "foo.jpg", "cat": "nikko"});
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
            {"op": "replace", "path": "/image", "value": "foo.jpg"},
            {"op": "replace", "path": "/cat", "value": "nikko"},
        ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn diffs_objects_nested_in_arrays() {
        let input = json!([{"A": 1, "B": 2}, {"C": 3}]);
        let output = json!([{"A": 1, "B": 20}, {"C": 3}]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
            {"op": "replace", "path": "/0/B", "value": 20},
        ])).unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }
}

mod diff_arrays {
    #![allow(unused)]

    use serde_json::json;
    use super::*;

    #[test]
    fn it_works() {
        let input = json!(["A", "Z", "Z"]);
        let output = json!(["A"]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
          { "op": "remove", "path": "/1" },
          { "op": "remove", "path": "/1" },
        ])).unwrap();
        let patch = diff_arrays(&input.as_array().unwrap(), &output.as_array().unwrap(), "");
        eprintln!("patch: {:?}", patch);
        assert_eq!(patch, actual);
    }
}
