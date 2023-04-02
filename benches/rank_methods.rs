use libapproportionment::methods::RankMethod;

pub const MIN_RANK_METHOD: RankMethod = RankMethod {
    normal: 0.,
    min_party: 1.,
    avg_party: 0.,
};

pub const AVG_RANK_METHOD: RankMethod = RankMethod {
    normal: 0.,
    min_party: 0.,
    avg_party: 1.,
};

