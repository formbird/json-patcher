pub mod diff;
#[cfg(not(target_arch = "wasm32"))]
mod node;

#[cfg(not(target_arch = "wasm32"))]
pub use node::*;
use std::borrow::Cow;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[cfg(target_arch = "wasm32")]
mod wasm;
#[cfg(target_arch = "wasm32")]
pub use wasm::*;

/// JSON Patch 'add' operation representation
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct AddOperation<'v> {
    /// JSON-Pointer value [RFC6901](https://tools.ietf.org/html/rfc6901) that references a location
    /// within the target document where the operation is performed.
    pub path: String,
    /// Value to add to the target location.
    #[serde(borrow)]
    pub value: Cow<'v, Value>,
}

/// JSON Patch 'remove' operation representation
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct RemoveOperation {
    /// JSON-Pointer value [RFC6901](https://tools.ietf.org/html/rfc6901) that references a location
    /// within the target document where the operation is performed.
    pub path: String,
}

/// JSON Patch 'replace' operation representation
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]

pub struct ReplaceOperation<'v> {
    /// JSON-Pointer value [RFC6901](https://tools.ietf.org/html/rfc6901) that references a location
    /// within the target document where the operation is performed.
    pub path: String,
    /// Value to replace with.
    #[serde(borrow)]
    pub value: Cow<'v, Value>,
}

/// JSON Patch 'move' operation representation
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct MoveOperation {
    /// JSON-Pointer value [RFC6901](https://tools.ietf.org/html/rfc6901) that references a location
    /// to move value from.
    pub from: String,
    /// JSON-Pointer value [RFC6901](https://tools.ietf.org/html/rfc6901) that references a location
    /// within the target document where the operation is performed.
    pub path: String,
}

/// JSON Patch 'copy' operation representation
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct CopyOperation {
    /// JSON-Pointer value [RFC6901](https://tools.ietf.org/html/rfc6901) that references a location
    /// to copy value from.
    pub from: String,
    /// JSON-Pointer value [RFC6901](https://tools.ietf.org/html/rfc6901) that references a location
    /// within the target document where the operation is performed.
    pub path: String,
}

/// JSON Patch 'test' operation representation
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct TestOperation<'v> {
    /// JSON-Pointer value [RFC6901](https://tools.ietf.org/html/rfc6901) that references a location
    /// within the target document where the operation is performed.
    pub path: String,
    /// Value to test against.
    #[serde(borrow)]
    pub value: Cow<'v, Value>,
}

/// JSON Patch single patch operation
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
#[serde(tag = "op")]
#[serde(rename_all = "lowercase")]
pub enum PatchOperation<'v> {
    /// 'add' operation
    #[serde(borrow)]
    Add(AddOperation<'v>),
    /// 'remove' operation
    Remove(RemoveOperation),
    /// 'replace' operation
    #[serde(borrow)]
    Replace(ReplaceOperation<'v>),
    /// 'move' operation
    Move(MoveOperation),
    /// 'copy' operation
    Copy(CopyOperation),
    /// 'test' operation
    #[serde(borrow)]
    Test(TestOperation<'v>),
}
