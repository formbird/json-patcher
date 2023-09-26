use criterion::{black_box, criterion_group, criterion_main, Criterion};
use serde_json::Value;

fn criterion_benchmark(c: &mut Criterion) {

    let input = {
        let json = include_str!("data/base.json");
        serde_json::from_str::<Value>(json).unwrap()
    };
    let output = {
        let json = include_str!("data/updated.json");
        serde_json::from_str::<Value>(json).unwrap()
    };

    let mut group = c.benchmark_group("json-diff");
    group.bench_function("custom diff", |b| b.iter(|| {
        json_patcher::diff::diff_any(black_box(&input), black_box(&output), "");
    }));
    group.bench_function("diff", |b| b.iter(|| {
        json_patch::diff(black_box(&input), black_box(&output));
    }));
    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);