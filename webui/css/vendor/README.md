This directory contains a fork of [simplecss](https://simplecss.org/)

The fork of simplecss has the following changes:

- removed colorful styles for the `details` element
- removed styles for the `progress` HTML input element, as it turns the indeterminate progress bar animation into a blank bar.
    - This is no longer needed, but it happened to remove code and reduced the file size, so there is no reason to revert the changes as the HTML progress element is not used anymore.
- remove custom styles for sliders (`input[type="range"]`)
