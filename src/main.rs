mod config;
mod highest_averages;
mod largest_remainder;
mod simulator;
mod types;
mod utils;

use std::{
    collections::HashMap,
    env::args,
    fs::{create_dir_all, File},
    path::Path,
    sync::Arc,
};

use arrow::{
    array::{ArrayRef, Float64Array, UInt32Array},
    datatypes::{DataType, Field, Schema},
    ipc::writer::FileWriter,
    record_batch::RecordBatch,
};
use config::*;
use highest_averages::*;
use indicatif::ProgressBar;
use largest_remainder::*;
use rayon::prelude::*;
use types::*;
use utils::*;

#[cfg(test)]
mod test_utils;
#[cfg(test)]
use test_utils::*;

#[cfg(test)]
mod test_config;

fn main() {
    let file = args().nth(1).unwrap();
    let r_configs: Result<Configs, _> = serde_dhall::from_file(file)
        .static_type_annotation()
        .parse();
    let configs = r_configs.unwrap_or_else(|r| {
        println!("{}", r);
        panic!()
    });

    let total_runs: u64 = configs
        .iter()
        .map(|c| {
            let n_voters = c.n_voters as u64;
            // TODO: if domain is customizable this will change too
            // there are 200 values between -100 to 100
            let n_coords = 200 * 200;
            let n_methods = c.allocation_methods.len() as u64;
            n_voters * n_coords * n_methods
        })
        .sum();

    let bar = ProgressBar::new(total_runs);
    configs.into_par_iter().for_each(|config| {
        run_config(config, &bar);
    });
    bar.finish();
}

fn run_config(config: Config, bar: &ProgressBar) {
    let parties: Vec<Party> = config.parties.into_iter().collect();

    let out_dir = config.data_out_dir;
    let path = Path::new(&out_dir);
    if !path.exists() {
        create_dir_all(path).unwrap();
    }

    config
        .allocation_methods
        .into_par_iter()
        .for_each(|method| {
            let rs = method.simulate_elections(
                config.n_seats,
                config.n_voters,
                &parties,
                bar,
            );

            let schema = Schema {
                fields: vec![
                    Field::new("x", DataType::Float64, false),
                    Field::new("y", DataType::Float64, false),
                    Field::new("party_x", DataType::Float64, false),
                    Field::new("party_y", DataType::Float64, false),
                    Field::new("seats_for_party", DataType::UInt32, false),
                ],
                metadata: HashMap::new(),
            };
            let total_rows = 200 * 200 * parties.len();

            let mut xs = Float64Array::builder(total_rows);
            let mut ys = Float64Array::builder(total_rows);
            let mut party_xs = Float64Array::builder(total_rows);
            let mut party_ys = Float64Array::builder(total_rows);
            let mut seats = UInt32Array::builder(total_rows);
            for ((x, y), hmap) in rs {
                for (p, s) in hmap {
                    xs.append_value(x);
                    ys.append_value(y);
                    party_xs.append_value(p.x);
                    party_ys.append_value(p.y);
                    seats.append_value(s);
                }
            }

            let columns: Vec<ArrayRef> = vec![
                Arc::new(xs.finish()),
                Arc::new(ys.finish()),
                Arc::new(party_xs.finish()),
                Arc::new(party_ys.finish()),
                Arc::new(seats.finish()),
            ];
            let batch = RecordBatch::try_new(Arc::new(schema.clone()), columns)
                .unwrap();

            let f = File::create(path.join(method.filename())).unwrap();
            let mut w = FileWriter::try_new(f, &schema).unwrap();
            w.write(&batch).unwrap();
            w.finish().unwrap();
        });
}
