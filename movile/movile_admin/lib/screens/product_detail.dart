import 'package:flutter/material.dart';
import '../models/product.dart';
import '../models/batch.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({Key? key}) : super(key: key);

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 160,
            child: Text(label, style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final Product product = args['product'] as Product;
    final Batch batch = args['batch'] as Batch;

    return Scaffold(
      appBar: AppBar(title: Text('Detalle - ${product.name}')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Image.network(
                  product.imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Icon(Icons.image, size: 80),
                ),
              ),
            ),
            SizedBox(height: 16),
            _row('Producto ID', product.id),
            _row('Nombre', product.name),
            _row('Código de barras', batch.barcode),
            _row('ICU', '—'),
            _row(
              'Precio Compra',
              product.purchasePrice != null
                  ? '\$${product.purchasePrice!.toStringAsFixed(0)}'
                  : '—',
            ),
            _row(
              'Precio Venta',
              product.salePrice != null
                  ? '\$${product.salePrice!.toStringAsFixed(0)}'
                  : '—',
            ),
            _row(
              'Subida de Venta (%)',
              product.markupPercent != null ? '${product.markupPercent}%' : '—',
            ),
            _row(
              'IVA',
              product.ivaPercent != null ? '${product.ivaPercent}%' : '—',
            ),
            _row(
              'Fecha de vencimiento',
              '${batch.expiryDate.toIso8601String().split('T')[0]}',
            ),
            _row('Max Stock', product.maxStock.toString()),
            _row('Mini Stock', product.minStock.toString()),
            _row('Stock total', product.currentStock.toString()),
          ],
        ),
      ),
    );
  }
}
