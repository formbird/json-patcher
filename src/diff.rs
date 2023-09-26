use indexmap::IndexMap;
use json_patch::{AddOperation, PatchOperation, RemoveOperation, ReplaceOperation};
use serde_json::{Map, Value};

pub fn subtract<'m>(
    minuend: &'m Map<String, Value>,
    subtrahend: &'m Map<String, Value>,
) -> Vec<&'m String> {
    let mut result = Vec::new();

    for (key, _) in minuend.iter().filter(|(_, value)| !value.is_null()) {
        if !subtrahend.contains_key(key) {
            result.push(key);
        }
    }

    result
}

pub fn intersection<'k>(objects: [&'k Map<String, Value>; 2]) -> IndexMap<&'k String, i32> {
    let length = objects.len();
    // prepare empty counter to keep track of how many objects each key occurred in
    let mut counter: IndexMap<&'k String, i32> = IndexMap::with_capacity(length);
    // go through each object and increment the counter for each key in that object
    for object in objects {
        for (key, _) in object {
            let count = counter.entry(key).or_insert(0);
            *count += 1;
        }
    }
    // now delete all keys from the counter that were not seen in every object
    counter.retain(|_, &mut v| v == length as i32);
    // finally, extract whatever keys remain in the counter
    counter
}

pub fn diff_any(input: &Value, output: &Value, ptr: &str) -> Vec<PatchOperation> {
    if input == output {
        return Vec::new();
    }

    match (input, output) {
        (Value::Array(input_array), Value::Array(output_array)) => {
            diff_arrays(ptr, input_array, output_array)
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
            value: output[key].clone(),
        }));
    }

    for (key, _) in intersection([input, output]) {
        let key_ptr = format!("{}/{}", ptr, key);
        let key_operations = diff_any(&input[key], &output[key], &key_ptr);
        operations.extend(key_operations);
    }

    operations
}

pub fn diff_arrays(ptr: &str, input: &Vec<Value>, output: &Vec<Value>) -> Vec<PatchOperation> {
    let mut patches = Vec::new();

    // Handle replacements and additions
    for (index, value) in output.iter().enumerate() {
        match input.get(index) {
            Some(old_value) if old_value != value => {
                patches.extend(diff_any(old_value, value, &format!("{}/{}", ptr, index)))
            }
            None => {
                patches.push(PatchOperation::Add(AddOperation {
                    path: format!("{}/{}", ptr, index),
                    value: value.clone(),
                }));
            }
            _ => {}
        }
    }

    // Handle removals
    let mut offset = 0;
    if input.len() > output.len() {
        for (index, item) in input.iter().enumerate().skip(output.len()) {
            if output.get(index) != Some(item) {
                patches.push(PatchOperation::Remove(RemoveOperation {
                    path: format!("{}/{}", ptr, index - offset),
                }));
                offset += 1;
            }
        }
    }

    patches
}

#[cfg(test)]
mod test {
    use super::diff_any as diff;
    use json_patch::PatchOperation;
    use serde_json::json;

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
        ]))
        .unwrap();
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
        ]))
        .unwrap();
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
        ]))
        .unwrap();
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
        ]))
        .unwrap();
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
        ]))
        .unwrap();
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
        ]))
        .unwrap();
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
        ]))
        .unwrap();
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
        ]))
        .unwrap();
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
        ]))
        .unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }

    #[test]
    fn diffs_objects_nested_in_arrays() {
        let input = json!([{"A": 1, "B": 2}, {"C": 3}]);
        let output = json!([{"A": 1, "B": 20}, {"C": 3}]);
        let actual: Vec<PatchOperation> = serde_json::from_value(json!([
            {"op": "replace", "path": "/0/B", "value": 20},
        ]))
        .unwrap();
        let patch = diff(&input, &output, "");
        assert_eq!(patch, actual);
    }
}
