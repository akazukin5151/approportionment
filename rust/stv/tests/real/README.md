These tests runs the STV algorithm with real world election data. Download the BLT files from https://www.glasgow.gov.uk/index.aspx?articleid=29269 to the data dir and run:

```sh
cargo test --lib real --features test_real_stv
```

Note that these elections uses Scottish STV, which is slightly different from the Australian Senate. So if a new election is added and the test fails, it might not necessarily be a bug with the Australian STV algorithm.

Australia does not release the full preference data for their elections, so the Scottish STV elections are used as they are the most similar alternative.
