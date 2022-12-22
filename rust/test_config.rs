#[cfg(test)]
mod test {
    use crate::config::Configs;

    #[test]
    fn load_config() {
        if std::env::var("CI").is_ok() {
            return
        }
        serde_dhall::from_file("config/config.dhall")
            .static_type_annotation()
            .parse::<Configs>()
            .unwrap_or_else(|r| {
                println!("{}", r);
                panic!()
            });
    }
}
