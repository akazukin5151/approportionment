use crate::config::Configs;

fn load_config(name: &str) {
    // CI doesn't like Dhall's standard library, even with hashes removed
    if std::env::var("CI").is_ok() {
        return;
    }
    serde_dhall::from_file(name)
        .parse::<Configs>()
        .unwrap_or_else(|r| {
            println!("{r}");
            panic!()
        });
}

#[test]
fn load_normal_config() {
    load_config("config/config.dhall")
}

#[test]
fn load_stv_config() {
    load_config("config/stv-profiling.dhall")
}

