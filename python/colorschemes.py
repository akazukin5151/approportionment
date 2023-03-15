from __future__ import annotations
from typing import Generic, TypeVar
from typing import TYPE_CHECKING
from abc import ABC, abstractmethod
from matplotlib.patches import Circle
import matplotlib as mpl
import pandas as pd

if TYPE_CHECKING:
    from typing import Union, Callable
    import numpy as np
    import numpy.typing as npt

C = TypeVar('C', bound='Colorscheme')
Rgb = tuple[float, float, float]

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
    def get_cmap(p: dict[str, str]) -> Union[str, list[list[float]]]:
        """Extract the cmap"""

    @staticmethod
    @abstractmethod
    def add_color_col(
        cmap: Union[str, list[list[float]]],
        df_for_party: pd.DataFrame,
        total_seats: int
    ) -> None:
        """Add the color column to the df"""

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
    def get_cmap(_: dict[str, str]) -> Union[str, list[list[float]]]:
        red = mpl.colormaps['tab10'](3)
        green = mpl.colormaps['tab10'](2)
        return [red, green]

    @staticmethod
    def add_color_col(
        cmap: Union[str, list[list[float]]],
        df: pd.DataFrame,
        total_seats: int
    ) -> None:
        # Suppress the setting with copy warning.
        # The warning is not a false positive, we are indeed
        # setting on a copy. This is what we want: we don't want Discrete
        # and Majority affecting each other's color columns.
        # Both starts fresh without a color column
        # `.copy()` can be added in the place where df_for_party is created
        # but this actually does a copy and consumes a lot of memory.
        # So this approach is superior
        with pd.option_context('mode.chained_assignment', None):
            df['seats_for_party'] = (
                (df['seats_for_party'] / total_seats) >= 0.5
            ).astype(int)

            df['color'] = df['seats_for_party'].apply(
                lambda m: cmap[0] if m == 0 else cmap[1]
            )

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
    def get_cmap(p: dict[str, str]) -> Union[str, list[list[float]]]:
        return p['palette_name']

    @staticmethod
    def add_color_col(
        cmap: Union[str, list[list[float]]],
        df_for_party: pd.DataFrame,
        _: int
    ) -> None:
        mapper = mpl.colormaps[cmap]
        # if this is a continuous colormap, resample it
        if mapper.N > 15:
            max_ = df_for_party['seats_for_party'].unique().size
            mapper = mapper.resampled(max_)
        mapper = nan_aware_cmap(mapper)
        # See Majority.add_color_col for explanation
        with pd.option_context('mode.chained_assignment', None):
            df_for_party['color'] = df_for_party['seats_for_party'].apply(mapper)

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

def nan_aware_cmap(
    mapper: Callable[[float], Rgb]
) -> Callable[[float], Rgb]:
    def inner(value: float) -> Rgb:
        if pd.isnull(value):
            return (0.6, 0.6, 0.6)
        else:
            return mapper(int(value))
    return inner

def find_pc(
    parties: list[dict[str, Union[str, int]]],
    name: str
) -> dict[str, Union[str, int]]:
    return [
        party
        for party in parties
        if party['name'] == name
    ][0]
