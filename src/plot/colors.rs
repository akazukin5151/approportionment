use crate::*;
use plotters::prelude::*;

pub fn party_seats_to_continuous_color(
    n_seats: u32,
    party: Option<&Party>,
    hmap: AllocationResult,
) -> RGBAColor {
    let party = party.as_ref().unwrap();
    let prop = *hmap.get(party).unwrap_or(&0) as f64 / n_seats as f64;
    party.color.mix(prop)
}

pub fn party_seats_to_discrete_color(
    _n_seats: u32,
    party: Option<&Party>,
    hmap: AllocationResult,
) -> RGBAColor {
    let party = party.as_ref().unwrap();
    let seats = *hmap.get(&party).unwrap_or(&0);
    Palette99::pick(seats as usize).to_rgba()
}

pub fn average_party_colors(
    n_seats: u32,
    party: Option<&Party>,
    hmap: AllocationResult,
) -> RGBAColor {
    let mut colors = vec![];
    for (party, seats) in hmap {
        let color = party.color;
        let prop = seats as f32 / n_seats as f32;
        let r = color.0 as f32 * prop;
        let g = color.1 as f32 * prop;
        let b = color.2 as f32 * prop;
        colors.push((r, g, b));
    }
    let (r, g, b) = colors
        .iter()
        .cloned()
        .reduce(|acc: (f32, f32, f32), item: (f32, f32, f32)| {
            (
                acc.0 + item.0.powi(2),
                acc.1 + item.1.powi(2),
                acc.2 + item.2.powi(2),
            )
        })
        .unwrap();

    // *2 to make it brighter
    RGBAColor(
        ((r / 3.).powf(0.5) * 2.) as u8,
        ((g / 3.).powf(0.5) * 2.) as u8,
        ((b / 3.).powf(0.5) * 2.) as u8,
        1.,
    )
}
