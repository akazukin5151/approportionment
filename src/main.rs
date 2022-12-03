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
use largest_remainder::*;
use plot::*;
use types::*;
use utils::*;

#[cfg(test)]
mod test_utils;
#[cfg(test)]
use test_utils::*;

fn main() {
    let file = args().nth(1).unwrap();
    let r_configs: Result<Configs, _> = serde_dhall::from_file(file)
        .static_type_annotation()
        .parse();
    let configs = r_configs.unwrap_or_else(|r| {
        println!("{}", r);
        panic!()
    });

    for config in configs {
        run_config(config);
    }
}

fn run_config(config: Config) {
    let parties: Vec<Party> = config.parties.iter().map(|x| x.into()).collect();

    if config.party_to_colorize.is_none()
        && !matches!(config.color, Color::Average)
    {
        panic!("party_to_colorize is missing")
    }

    // If it is None here, config.color is Average which will ignore it
    let c = config.party_to_colorize.unwrap_or_else(|| "".to_string());
    let party_to_colorize = parties.iter().find(|p| p.name == c);

    let color_fn = match config.color {
        Color::Continuous => party_seats_to_continuous_color,
        Color::Discrete => party_seats_to_discrete_color,
        Color::Average => average_party_colors,
    };

    let color =
        |hmap| color_fn(config.n_seats, party_to_colorize, hmap);

    let out_dir = config.out_dir;
    let path = Path::new(&out_dir);
    if !path.exists() {
        create_dir_all(path).unwrap();
    }

    for method in config.allocation_methods {
        let rs = method.simulate_elections(
            config.n_seats,
            config.n_voters,
            &parties,
        );
        plot(&parties, rs, path.join(method.filename()), color).unwrap();
    }
}
