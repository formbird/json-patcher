mod diff;
#[cfg(not(target_arch = "wasm32"))]
mod node;
#[cfg(not(target_arch = "wasm32"))]
pub use node::*;

pub use json_patch::{
    AddOperation, CopyOperation, MoveOperation, RemoveOperation, ReplaceOperation, TestOperation,
};
/*
#[cfg(target_arch = "wasm32")]
mod wasm;
#[cfg(target_arch = "wasm32")]
pub use wasm::*;
*/
