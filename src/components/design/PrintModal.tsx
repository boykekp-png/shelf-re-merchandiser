/**
 * EN: PrintModal — Print/PDF preview modal for a design.
 *     Renders all shelves as a printer-friendly grid.
 *     Supports browser print (window.print) and Save as PDF (jsPDF + html2canvas).
 *     Dynamically imports heavy PDF libraries only when needed.
 *
 * ID: PrintModal — Modal pratinjau cetak/PDF untuk sebuah desain.
 *     Merender semua rak sebagai grid yang ramah printer.
 *     Mendukung cetak browser (window.print) dan Simpan sebagai PDF (jsPDF + html2canvas).
 *     Import dinamis library PDF berat hanya saat dibutuhkan.
 */

'use client';

import { useRef } from 'react';
import { X, Printer, FileDown } from 'lucide-react';
import type { DesignWithShelves } from '@/types';

const emojiMap: Record<string, string> = {
  'Banana': '🍌', 'Apple': '🍎', 'Cherry': '🍒', 'Kiwi': '🥝',
  'Grape': '', 'Fig': '🫒', 'Honeydew': '🍈', 'Dates': '🫐',
  'Lemon': '🍋', 'Mango': '', 'Chicken Breast': '🍗',
  'Ground Beef': '🥩', 'Pork Chop': '🍖', 'Salmon Fillet': '🐟',
  'Turkey Breast': '🦃', 'Smoked Turkey Sliced': '🥪', 'Bacon': '🥓',
  'Salami': '🍖', 'Provolone Cheese': '🧀', 'Ham': '🍖',
  'Milk Gallon': '', 'Half Gallon Milk': '🥛', 'Sour Cream': '🫗',
  'Yogurt': '🍦', 'Butter': '🧈', 'Heavy Cream': '🥛',
  'Sourdough Bread': '🍞', 'Croissant': '🥐', 'Bagel': '🥯',
  'Blueberry Muffin': '🧁', 'Baguette': '🥖', 'Canned Beans': '🥫',
  'Pasta': '🍝', 'Rice': '🍚', 'Olive Oil': '🫒', 'Cereal': '🥣',
  'Peanut Butter': '🥜',
};

interface PrintModalProps {
  design: DesignWithShelves;
  onClose: () => void;
}

export default function PrintModal({ design, onClose }: PrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // EN: Native browser print / ID: Cetak native browser
  const handlePrint = () => {
    window.print();
  };

  // EN: Generate PDF using jsPDF + html2canvas (dynamic import) / ID: Hasilkan PDF menggunakan jsPDF + html2canvas (import dinamis)
  const handleSavePdf = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      if (!printRef.current) return;

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${design.name.replace(/\s+/g, '_')}_shelf_design.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try printing instead.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {/* EN: Toolbar (hidden in print) / ID: Toolbar (tersembunyi saat cetak) */}
        <div className="flex items-center justify-between p-4 border-b no-print">
          <h2 className="text-lg font-semibold">Print Preview</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleSavePdf} className="toolbar-btn">
              <FileDown className="w-4 h-4" /> Save PDF
            </button>
            <button onClick={handlePrint} className="toolbar-btn primary">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* EN: Printable content / ID: Konten yang dapat dicetak */}
        <div className="p-6 overflow-auto max-h-[70vh]">
          <div ref={printRef} className="print-area">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{design.name}</h1>
              <p className="text-sm text-gray-500">
                {design.description && `${design.description} · `}
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* EN: Render each shelf / ID: Render setiap rak */}
            <div className="flex flex-col gap-4">
              {design.shelves.map((shelf) => (
                <div key={shelf.id} className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                    <h3 className="font-semibold text-sm">{shelf.name}</h3>
                  </div>
                  <div className="grid grid-cols-12 gap-1 p-2 min-h-[5rem]">
                    {(() => {
                      const occupied = new Array(12).fill(false);
                      const positions: Record<number, any> = {};
                      for (const item of shelf.items) {
                        positions[item.gridPosition] = item;
                        occupied[item.gridPosition] = true;
                      }
                      // EN: Render 12 columns with items or empty slots / ID: Render 12 kolom dengan item atau slot kosong
                      return Array.from({ length: 12 }, (_, col) => {
                        const item = positions[col];
                        if (item) {
                          const emoji = emojiMap[item.product.name] || '📦';
                          return (
                            <div
                              key={item.id}
                              className="border border-gray-300 rounded-lg p-2 flex flex-col items-center"
                              style={{ gridColumn: `${col + 1}` }}
                            >
                              <span className="text-2xl">{emoji}</span>
                              <span className="text-[10px] font-medium text-center">{item.product.name}</span>
                              <span className="text-[8px] text-gray-500">{item.product.category.icon} {item.product.category.name}</span>
                            </div>
                          );
                        } else if (!occupied[col]) {
                          return (
                            <div key={`empty-${col}`} className="border border-dashed border-gray-200 rounded min-h-[3rem]" />
                          );
                        }
                        return null;
                      });
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}