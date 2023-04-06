use libapproportionment::types::Party;

pub const TRIANGLE_PARTIES: &[Party; 3] = &[
    Party {
        x: -0.8,
        y: -0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
    Party {
        x: -0.2,
        y: -0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
    Party {
        x: 0.0,
        y: -0.73,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
];

pub const PARTIES_8: &[Party; 8] = &[
    Party {
        x: -0.7,
        y: 0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(3),
    },
    Party {
        x: 0.7,
        y: 0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(0),
    },
    Party {
        x: 0.7,
        y: -0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(1),
    },
    Party {
        x: -0.7,
        y: -0.7,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(2),
    },
    Party {
        x: -0.4,
        y: -0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(2),
    },
    Party {
        x: 0.4,
        y: 0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(0),
    },
    Party {
        x: -0.4,
        y: 0.5,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(3),
    },
    Party {
        x: 0.4,
        y: -0.5,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(1),
    },
];

pub const EXTRA_PARTIES: &[Party; 5] = &[
    Party {
        x: -0.9,
        y: 0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(3),
    },
    Party {
        x: 0.8,
        y: 0.6,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(0),
    },
    Party {
        x: -0.8,
        y: -0.5,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(2),
    },
    Party {
        x: 0.8,
        y: -0.5,
        #[cfg(feature = "stv_party_discipline")]
        coalition: Some(1),
    },
    Party {
        x: 0.0,
        y: -0.8,
        #[cfg(feature = "stv_party_discipline")]
        coalition: None,
    },
];

pub fn parties_13() -> Vec<Party> {
    let mut parties: Vec<Party> = vec![];
    // this is a workaround for Party not having Clone
    // conditional derive for test doesn't work so we manually copy the values
    // don't want to derive it just for benchmarks
    for party in PARTIES_8.iter().chain(EXTRA_PARTIES) {
        let party = Party {
            x: party.x,
            y: party.y,
            #[cfg(feature = "stv_party_discipline")]
            coalition: party.coalition,
        };
        parties.push(party);
    }
    parties
}
