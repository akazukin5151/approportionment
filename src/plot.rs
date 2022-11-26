use crate::types::*;
use plotters::prelude::*;

pub fn plot(
    n_seats: u32,
    parties: &[Party],
    rs: Vec<((f64, f64), AllocationResult)>,
) -> Result<(), Box<dyn std::error::Error>> {
    let root =
        BitMapBackend::new("out/out.png", (1000, 1000)).into_drawing_area();
    root.fill(&WHITE)?;

    //root.draw(&Rectangle::new(
    //    [(0_i32, 0_i32), (10_i32, 10_i32)],
    //    Into::<ShapeStyle>::into(&GREEN).filled(),
    //))?;

    let mut chart =
        ChartBuilder::on(&root).build_cartesian_2d(-1f64..1f64, -1f64..1f64)?;

    chart.configure_mesh().draw()?;

    for (coords, hmap) in rs {
        let color = mix_party_colors(n_seats, hmap);
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
                EmptyElement::at(c)
                    + Circle::new((0, 0), s, st.filled())
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

fn mix_party_colors(n_seats: u32, hmap: AllocationResult) -> RGBColor {
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
