use std::collections::HashSet;

use crate::*;
use plotters::{prelude::*, style::full_palette::GREY};

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

    let mut seen = HashSet::new();
    let mut idx = 0;
    for (coords, hmap) in rs {
        let al: Vec<(Party, u32)> =
            hmap.iter().map(|(k, v)| (k.clone(), *v)).collect();
        if seen.insert(al) {
            idx += 1;
        };
        let color = Palette99::pick(idx).mix(0.9);
        chart.draw_series(PointSeries::of_element(
            [coords],
            5,
            color,
            &|c, s, st| {
                EmptyElement::at(c) + Circle::new((0, 0), s, st.filled())
            },
        ))?;
    }

    chart.draw_series(PointSeries::of_element(
        parties.iter().map(|p| (p.x, p.y)),
        5,
        &RED,
        &|c, s, st| {
            return EmptyElement::at(c)
                + Circle::new((0, 0), s, st.filled())
                + Text::new(
                    format!("{:?}", c),
                    (10, 0),
                    ("sans-serif", 10).into_font(),
                );
        },
    ))?;

    root.present()?;
    Ok(())
}
