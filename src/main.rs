mod config;
mod highest_averages;
mod largest_remainder;
mod plot;
mod simulator;
mod types;
mod utils;

use std::{env::args, fs::create_dir_all, path::Path};

use config::*;
use highest_averages::*;
use indicatif::ProgressBar;
use largest_remainder::*;
use plot::*;
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
    let parties: Vec<Party> =
        config.parties.into_iter().map(|x| x.into()).collect();

    if config.party_to_colorize.is_none()
        && !matches!(config.color, Color::Average)
    {
        panic!("party_to_colorize is missing")
    }

    // If it is None here, config.color is Average which will ignore it
    let c = config.party_to_colorize.unwrap_or_else(|| "".to_string());
    let party_to_colorize = parties.iter().find(|p| p.name == c);

    let color_fn = config.color.colorize_results_fn();

    let color = |results| color_fn(results, config.n_seats, party_to_colorize);

    let out_dir = config.out_dir;
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
            plot(&parties, rs, path.join(method.filename()), color).unwrap();
        });
}
