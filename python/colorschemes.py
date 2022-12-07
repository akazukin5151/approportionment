from __future__ import annotations
from typing import Generic, TypeVar
from typing import TYPE_CHECKING
from abc import ABC, abstractmethod
from matplotlib.patches import Circle
import matplotlib as mpl

if TYPE_CHECKING:
    from typing import Union
    import pandas as pd
    import numpy as np
    import numpy.typing as npt

C = TypeVar('C', bound='Colorscheme')

class Colorscheme(ABC, Generic[C]):
    """Interface that every colorscheme must implement"""
    @staticmethod
    @abstractmethod
    def get_party_to_colorize(
        p: dict[str, str],
        parties: list[dict[str, Union[str, int]]]
    ) -> dict[str, Union[str, int]]:
        """Extract party_to_colorize"""

    @staticmethod
    @abstractmethod
    def get_cmap(
        p: dict[str, str],
        df: pd.DataFrame,
        total_seats: int
    ) -> Union[str, list[list[float]]]:
        """Calculate cmap and calculate the color column for the df"""

    @staticmethod
    @abstractmethod
    def legend_items(
        palette: Union[str, list[list[float]]],
        unique_seats: npt.NDArray[np.int_]
    ) -> list[Circle]:
        """Calculate the legend items"""

class Majority(Colorscheme):
    @staticmethod
    def get_party_to_colorize(
        p: dict[str, str],
        parties: list[dict[str, Union[str, int]]]
    ) -> dict[str, Union[str, int]]:
        return find_pc(parties, p['for_party'])

    @staticmethod
    def get_cmap(
        _: dict[str, str],
        df: pd.DataFrame,
        total_seats: int
    ) -> Union[str, list[list[float]]]:
        df['seats_for_party'] = (
            (df['seats_for_party'] / total_seats) >= 0.5
        ).astype(int)
        red = mpl.colormaps['tab10'](3)
        green = mpl.colormaps['tab10'](2)
        cmap: list[list[float]] = [red, green]
        df['color'] = df['seats_for_party'].apply(
            lambda m: cmap[0] if m == 0 else cmap[1]
        )
        return cmap

    @staticmethod
    def legend_items(
        palette: Union[str, list[list[float]]],
        _: npt.NDArray[np.int_]
    ) -> list[Circle]:
        return [Circle((0, 0), 1, color=c) for c in palette]

class Discrete(Colorscheme):
    @staticmethod
    def get_party_to_colorize(
        p: dict[str, str],
        parties: list[dict[str, Union[str, int]]]
    ) -> dict[str, Union[str, int]]:
        return find_pc(parties, p['party_to_colorize'])

    @staticmethod
    def get_cmap(
        p: dict[str, str],
        df_for_party: pd.DataFrame,
        total_seats: int
    ) -> Union[str, list[list[float]]]:
        cmap = p['palette_name']
        mapper = mpl.colormaps[cmap]
        # if this is a continuous colormap, resample it
        if mapper.N > 15:
            max_ = df_for_party['seats_for_party'].unique().size
            mapper = mapper.resampled(max_)
        df_for_party['color'] = df_for_party['seats_for_party'].apply(mapper)
        return cmap

    @staticmethod
    def legend_items(
        palette: Union[str, list[list[float]]],
        unique_seats: npt.NDArray[np.int_]
    ) -> list[Circle]:
        colors = mpl.colormaps[palette]
        # if this is a continuous colormap, resample it
        if colors.N > 15:
            colors = colors.resampled(unique_seats.size)
        return [Circle((0, 0), 1, color=colors(i)) for i in unique_seats]

def find_pc(
    parties: list[dict[str, Union[str, int]]],
    name: str
) -> dict[str, Union[str, int]]:
    return [
        party
        for party in parties
        if party['name'] == name
    ][0]
