use crate::types::*;
use plotters::prelude::*;

pub fn plot(
    n_seats: u32,
    parties: &[Party],
    rs: Vec<((f64, f64), AllocationResult)>,
    file: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let root =
        BitMapBackend::new(file, (1000, 1000)).into_drawing_area();
    root.fill(&WHITE)?;

    let mut chart =
        ChartBuilder::on(&root).build_cartesian_2d(-1f64..1f64, -1f64..1f64)?;

    chart.configure_mesh().draw()?;

    for (coords, hmap) in rs {
        //let color = average_party_colors(n_seats, hmap);
        let color = party_seats_to_color(n_seats, parties[3].clone(), hmap);
        chart.draw_series(PointSeries::of_element(
            [coords],
            2,
            color,
            &|c, s, st| {
                EmptyElement::at(c) + Circle::new((0, 0), s, st.filled())
            },
        ))?;
    }

    for party in parties {
        chart.draw_series(PointSeries::of_element(
            [(party.x, party.y)],
            10,
            party.color,
            &|c, s, st| {
                EmptyElement::at(c) + Circle::new((0, 0), s, st.filled())
                //+ Text::new(
                //    format!("{:?}", c),
                //    (10, 0),
                //    ("sans-serif", 10).into_font(),
                //)
            },
        ))?;
    }

    root.present()?;
    Ok(())
}

fn party_seats_to_color(
    n_seats: u32,
    party: Party,
    hmap: AllocationResult,
) -> RGBAColor {
    let prop = *hmap.get(&party).unwrap_or(&0) as f64 / n_seats as f64;
    party.color.mix(prop)
}

fn average_party_colors(n_seats: u32, hmap: AllocationResult) -> RGBColor {
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
    RGBColor(
        ((r / 3.).powf(0.5) * 2.) as u8,
        ((g / 3.).powf(0.5) * 2.) as u8,
        ((b / 3.).powf(0.5) * 2.) as u8,
    )
}
