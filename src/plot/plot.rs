use crate::types::*;
use plotters::prelude::*;

pub fn plot<F>(
    parties: &[Party],
    rs: Vec<((f64, f64), AllocationResult)>,
    file: &str,
    color: F,
) -> Result<(), Box<dyn std::error::Error>>
where
    F: Fn(AllocationResult) -> RGBAColor,
{
    let root = BitMapBackend::new(file, (1000, 1000)).into_drawing_area();
    root.fill(&WHITE)?;

    let mut chart =
        ChartBuilder::on(&root).build_cartesian_2d(-1f64..1f64, -1f64..1f64)?;

    chart.configure_mesh().draw()?;

    for (coords, hmap) in rs {
        chart.draw_series(PointSeries::of_element(
            [coords],
            2,
            color(hmap),
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
            },
        ))?;
    }

    root.present()?;
    Ok(())
}
