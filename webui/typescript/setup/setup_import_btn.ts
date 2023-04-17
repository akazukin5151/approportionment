import { import_json } from "../import";
import { AllCanvases } from "../types/canvas";

export function setup_import_btn(
  all_canvases: AllCanvases,
): void {
  const btn = document.getElementById('import-btn')!;
  const input = document.getElementById('import-input') as HTMLInputElement;
  btn.addEventListener('click', () => {
    input.click()
  })
  input.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      const reader = new FileReader()

      // describe what we want to do after reading the file
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          const cache = JSON.parse(reader.result)
          import_json(all_canvases, cache)
        }
      })

      // actually read the file here
      reader.readAsText(this.files[0])
    }
  })
}
