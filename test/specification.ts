export default [
    {
        "name": "A.1. Adding an Object Member",
        "input": {
            "foo": "bar"
        },
        "patch": [
            {
                "op": "add",
                "path": "/baz",
                "value": "qux"
            }
        ],
        "output": {
            "baz": "qux",
            "foo": "bar"
        },
        "results": [
            null
        ],
        "diffable": true
    },
    {
        "name": "A.2. Adding an Array Element",
        "input": {
            "foo": [
                "bar",
                "baz"
            ]
        },
        "patch": [
            {
                "op": "add",
                "path": "/foo/1",
                "value": "qux"
            }
        ],
        "output": {
            "foo": [
                "bar",
                "qux",
                "baz"
            ]
        },
        "results": [
            null
        ],
        "ignored": true,
        "diffable": true
    },
    {
        "name": "A.3. Removing an Object Member",
        "input": {
            "baz": "qux",
            "foo": "bar"
        },
        "patch": [
            {
                "op": "remove",
                "path": "/baz"
            }
        ],
        "output": {
            "foo": "bar"
        },
        "results": [
            null
        ],
        "diffable": true
    },
    {
        "name": "A.4. Removing an Array Element",
        "input": {
            "foo": [
                "bar",
                "qux",
                "baz"
            ]
        },
        "patch": [
            {
                "op": "remove",
                "path": "/foo/1"
            }
        ],
        "output": {
            "foo": [
                "bar",
                "baz"
            ]
        },
        "results": [
            null
        ],
        "ignored": true,
        "diffable": true
    },
    {
        "name": "A.5. Replacing a Value",
        "input": {
            "baz": "qux",
            "foo": "bar"
        },
        "patch": [
            {
                "op": "replace",
                "path": "/baz",
                "value": "boo"
            }
        ],
        "output": {
            "baz": "boo",
            "foo": "bar"
        },
        "results": [
            null
        ],
        "diffable": true
    },
    {
        "name": "A.6. Moving a Value",
        "input": {
            "foo": {
                "bar": "baz",
                "waldo": "fred"
            },
            "qux": {
                "corge": "grault"
            }
        },
        "patch": [
            {
                "op": "move",
                "from": "/foo/waldo",
                "path": "/qux/thud"
            }
        ],
        "output": {
            "foo": {
                "bar": "baz"
            },
            "qux": {
                "corge": "grault",
                "thud": "fred"
            }
        },
        "results": [
            null
        ],
        "diffable": false
    },
    {
        "name": "A.7. Moving an Array Element",
        "input": {
            "foo": [
                "all",
                "grass",
                "cows",
                "eat"
            ]
        },
        "patch": [
            {
                "op": "move",
                "from": "/foo/1",
                "path": "/foo/3"
            }
        ],
        "output": {
            "foo": [
                "all",
                "cows",
                "eat",
                "grass"
            ]
        },
        "results": [
            null
        ],
        "diffable": false
    },
    {
        "name": "A.8. Testing a Value: Success",
        "input": {
            "baz": "qux",
            "foo": [
                "a",
                2,
                "c"
            ]
        },
        "patch": [
            {
                "op": "test",
                "path": "/baz",
                "value": "qux"
            },
            {
                "op": "test",
                "path": "/foo/1",
                "value": 2
            }
        ],
        "output": {
            "baz": "qux",
            "foo": [
                "a",
                2,
                "c"
            ]
        },
        "results": [
            null,
            null
        ],
        "diffable": true
    },
    {
        "name": "A.9. Testing a Value: Error",
        "input": {
            "baz": "qux"
        },
        "patch": [
            {
                "op": "test",
                "path": "/baz",
                "value": "bar"
            }
        ],
        "output": {
            "baz": "qux"
        },
        "results": [
            "TestError"
        ],
        "diffable": false
    },
    {
        "name": "A.10. Adding a Nested Member Object",
        "input": {
            "foo": "bar"
        },
        "patch": [
            {
                "op": "add",
                "path": "/child",
                "value": {
                    "grandchild": {}
                }
            }
        ],
        "output": {
            "foo": "bar",
            "child": {
                "grandchild": {}
            }
        },
        "results": [
            null
        ],
        "diffable": true
    },
    {
        "name": "A.11. Ignoring Unrecognized Elements",
        "input": {
            "foo": "bar"
        },
        "patch": [
            {
                "op": "add",
                "path": "/baz",
                "value": "qux",
                "xyz": 123
            }
        ],
        "output": {
            "foo": "bar",
            "baz": "qux"
        },
        "results": [
            null
        ],
        "diffable": false
    },
    {
        "name": "A.12. Adding to a Nonexistent Target",
        "input": {
            "foo": "bar"
        },
        "patch": [
            {
                "op": "add",
                "path": "/baz/bat",
                "value": "qux"
            }
        ],
        "output": {
            "foo": "bar"
        },
        "results": [
            "MissingError"
        ],
        "diffable": false
    },
    {
        "name": "A.13.2 Invalid JSON Patch Document",
        "input": {
            "foo": "bar"
        },
        "patch": [
            {
                "op": "transcend",
                "path": "/baz",
                "value": "qux"
            }
        ],
        "output": {
            "foo": "bar"
        },
        "results": [
            "InvalidOperationError"
        ],
        "diffable": false
    },
    {
        "name": "A.14. ~ Escape Ordering",
        "input": {
            "/": 9,
            "~1": 10
        },
        "patch": [
            {
                "op": "test",
                "path": "/~01",
                "value": 10
            }
        ],
        "output": {
            "/": 9,
            "~1": 10
        },
        "results": [
            null
        ],
        "diffable": true
    },
    {
        "name": "A.15. Comparing Strings and Numbers",
        "input": {
            "/": 9,
            "~1": 10
        },
        "patch": [
            {
                "op": "test",
                "path": "/~01",
                "value": "10"
            }
        ],
        "output": {
            "/": 9,
            "~1": 10
        },
        "results": [
            "TestError"
        ],
        "diffable": false
    },
    {
        "name": "A.16. Adding an Array Value",
        "input": {
            "foo": [
                "bar"
            ]
        },
        "patch": [
            {
                "op": "add",
                "path": "/foo/-",
                "value": [
                    "abc",
                    "def"
                ]
            }
        ],
        "output": {
            "foo": [
                "bar",
                [
                    "abc",
                    "def"
                ]
            ]
        },
        "results": [
            null
        ],
        "ignored": true,
        "diffable": true
    },
    {
        "name": "Test types (failure)",
        "input": {
            "whole": 3,
            "ish": "3.14",
            "parts": [
                3,
                141,
                592,
                654
            ],
            "exact": false,
            "natural": null,
            "approximation": "true",
            "float": {
                "significand": 314,
                "exponent": -2
            }
        },
        "output": {
            "whole": 3,
            "ish": "3.14",
            "parts": [
                3,
                141,
                592,
                654
            ],
            "exact": false,
            "natural": null,
            "approximation": "true",
            "float": {
                "significand": 314,
                "exponent": -2
            }
        },
        "patch": [
            {
                "op": "test",
                "path": "/whole",
                "value": "3"
            },
            {
                "op": "test",
                "path": "/ish",
                "value": 3.14
            },
            {
                "op": "test",
                "path": "/parts",
                "value": "3,141,592,654"
            },
            {
                "op": "test",
                "path": "/parts/3",
                "value": 654.001
            },
            {
                "op": "test",
                "path": "/natural"
            },
            {
                "op": "test",
                "path": "/approximation",
                "value": true
            },
            {
                "op": "test",
                "path": "/float",
                "value": [
                    [
                        "significand",
                        314
                    ],
                    [
                        "exponent",
                        -2
                    ]
                ]
            }
        ],
        "results": [
            "TestError",
            "TestError",
            "TestError",
            "TestError",
            "TestError",
            "TestError",
            "TestError"
        ],
        "diffable": false
    },
    {
        "name": "Test types (success)",
        "input": {
            "whole": 3,
            "ish": "3.14",
            "parts": [
                3,
                141,
                592,
                654
            ],
            "exact": false,
            "natural": null,
            "approximation": "true",
            "float": {
                "significand": 314,
                "exponent": -2
            }
        },
        "output": {
            "whole": 3,
            "ish": "3.14",
            "parts": [
                3,
                141,
                592,
                654
            ],
            "exact": false,
            "natural": null,
            "approximation": "true",
            "float": {
                "significand": 314,
                "exponent": -2
            }
        },
        "patch": [
            {
                "op": "test",
                "path": "/whole",
                "value": 3
            },
            {
                "op": "test",
                "path": "/ish",
                "value": "3.14"
            },
            {
                "op": "test",
                "path": "/parts",
                "value": [
                    3,
                    141,
                    592,
                    654
                ]
            },
            {
                "op": "test",
                "path": "/parts/3",
                "value": 654
            },
            {
                "op": "test",
                "path": "/natural",
                "value": null
            },
            {
                "op": "test",
                "path": "/approximation",
                "value": "true"
            },
            {
                "op": "test",
                "path": "/float",
                "value": {
                    "significand": 314,
                    "exponent": -2
                }
            }
        ],
        "results": [
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ],
        "diffable": true
    },
    {
        "name": "Array vs. Object",
        "input": {
            "repositories": [
                "amulet",
                "flickr-with-uploads"
            ]
        },
        "output": {
            "repositories": {}
        },
        "patch": [
            {
                "op": "replace",
                "path": "/repositories",
                "value": {}
            }
        ],
        "results": [
            null
        ],
        "ignored": true,
        "diffable": true
    }
]