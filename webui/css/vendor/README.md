This directory contains a fork of [simplecss](https://simplecss.org/) and the styles for [Github corners](https://tholman.com/github-corners/)

The styles for Github corners are moved here to satisfy HTML linters. There is no other change to the HTML and CSS.

The fork of simplecss has the following changes:

- removed styles for the `progress` HTML input element, as it turns the indeterminate progress bar animation into a blank bar.
    - This is no longer needed, but it happened to remove code and reduced the file size, so there is no reason to revert the changes as the HTML progress element is not used anymore.
