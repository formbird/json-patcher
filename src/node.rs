use json_patch::PatchOperation;
use neon::prelude::*;

macro_rules! map_err_to_neon {
    ($cx:expr, $val:expr) => {{
        match $val {
            Ok(v) => Ok(v),
            Err(e) => $cx.throw_error(e.to_string()),
        }
    }};
}

pub fn create_patch(mut cx: FunctionContext) -> JsResult<JsString> {
    let left = cx.argument::<JsString>(0)?;
    let left = map_err_to_neon!(cx, serde_json::from_str(&left.value(&mut cx)))?;

    let right = cx.argument::<JsString>(1)?;
    let right = map_err_to_neon!(cx, serde_json::from_str(&right.value(&mut cx)))?;

    let patch = crate::diff::diff_any(&left, &right, "");
    let s = map_err_to_neon!(cx, serde_json::to_string(&patch))?;
    Ok(JsString::new(&mut cx, &s))
}

pub fn apply_patch(mut cx: FunctionContext) -> JsResult<JsString> {
    let doc = cx.argument::<JsString>(0)?;
    let mut doc = map_err_to_neon!(cx, serde_json::from_str(&doc.value(&mut cx)))?;

    let patch = cx.argument::<JsString>(1)?;
    let patch: Vec<PatchOperation> =
        map_err_to_neon!(cx, serde_json::from_str(&patch.value(&mut cx)))?;

    map_err_to_neon!(cx, json_patch::patch(&mut doc, &patch))?;

    let s = map_err_to_neon!(cx, serde_json::to_string(&doc))?;
    Ok(JsString::new(&mut cx, &s))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("createPatch", create_patch)?;
    cx.export_function("applyPatch", apply_patch)?;
    Ok(())
}
