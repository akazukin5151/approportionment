#[cfg(test)]
mod test {
    use proptest::prop_assume;

    use crate::{config::Configs, types::Allocate};

    #[test]
    fn load_config() {
        serde_dhall::from_file("config/config.dhall")
            .static_type_annotation()
            .parse::<Configs>()
            .unwrap_or_else(|r| {
                println!("{}", r);
                panic!()
            });
    }
}
