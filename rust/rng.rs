use rand::RngCore;
use rand_core::impls::fill_bytes_via_next;

pub struct Fastrand(fastrand::Rng);

impl Fastrand {
    pub fn new() -> Self {
        Self(fastrand::Rng::new())
    }
}

impl RngCore for Fastrand {
    fn next_u32(&mut self) -> u32 {
        self.0.u32(u32::MIN..=u32::MAX)
    }

    fn next_u64(&mut self) -> u64 {
        self.0.u64(u64::MIN..=u64::MAX)
    }

    fn fill_bytes(&mut self, dest: &mut [u8]) {
        fill_bytes_via_next(self, dest)
    }

    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), rand::Error> {
        self.fill_bytes(dest);
        Ok(())
    }
}
