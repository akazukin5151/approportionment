import { cache } from "../cache";

export function setup_export_button() {
  const btn = document.getElementById('export-btn')!;
  btn.addEventListener('click', () => {
    if (!cache) {
      return
    }
    const j = JSON.stringify(cache)
    const str = "data:text/json;charset=utf-8," + encodeURIComponent(j)
    const a = document.createElement('a');
    a.setAttribute("href", str);
    a.setAttribute("download", "simulation_result.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
  })
}

