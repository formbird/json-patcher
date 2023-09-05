use json_patch::PatchOperation;
use serde::ser::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = createPatch)]
pub fn create_patch(left: String, right: String) -> Result<String, JsError> {
    let left = serde_json::from_str(&left)?;
    let right = serde_json::from_str(&right)?;
    let diff = json_patch::diff(&left, &right);
    let output = serde_json::to_string(&diff)?;
    Ok(output)
}

#[wasm_bindgen(js_name = applyPatch)]
pub fn apply_patch(doc: String, patches: String) -> Result<String, JsError> {
    let mut doc = serde_json::from_str(&doc)?;
    let patches: Vec<PatchOperation> = serde_json::from_str(&patches)?;
    json_patch::patch(&mut doc, &patches).expect("todo");
    let s = serde_json::to_string(&doc)?;
    Ok(s)
}
