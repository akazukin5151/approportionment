use std::{collections::HashMap, fs::File, path::PathBuf, sync::Arc};

use arrow::{
    array::{ArrayRef, Float32Array, UInt32Array},
    datatypes::{DataType, Field, Schema},
    ipc::writer::FileWriter,
    record_batch::RecordBatch,
};

use crate::types::*;

pub fn write_results(
    parties: &[XY],
    rs: &[SimulationResult],
    filename: PathBuf,
) {
    // setup
    let schema = Schema {
        fields: vec![
            Field::new("x", DataType::Float32, false),
            Field::new("y", DataType::Float32, false),
            Field::new("party_x", DataType::Float32, false),
            Field::new("party_y", DataType::Float32, false),
            Field::new("seats_for_party", DataType::UInt32, false),
        ],
        metadata: HashMap::new(),
    };
    let total_rows = 200 * 200 * parties.len();

    let mut xs = Float32Array::builder(total_rows);
    let mut ys = Float32Array::builder(total_rows);
    let mut party_xs = Float32Array::builder(total_rows);
    let mut party_ys = Float32Array::builder(total_rows);
    let mut seats = UInt32Array::builder(total_rows);

    // build
    for r in rs {
        for (i, s) in r.seats_by_party.iter().enumerate() {
            xs.append_value(r.x);
            ys.append_value(r.y);
            let p = &parties[i];
            party_xs.append_value(p.x);
            party_ys.append_value(p.y);
            seats.append_value(*s as u32);
        }
    }

    // write
    let columns: Vec<ArrayRef> = vec![
        Arc::new(xs.finish()),
        Arc::new(ys.finish()),
        Arc::new(party_xs.finish()),
        Arc::new(party_ys.finish()),
        Arc::new(seats.finish()),
    ];

    let f = File::create(filename).unwrap();
    let mut w = FileWriter::try_new(f, &schema).unwrap();
    let batch = RecordBatch::try_new(Arc::new(schema), columns).unwrap();
    w.write(&batch).unwrap();
    w.finish().unwrap();
}
