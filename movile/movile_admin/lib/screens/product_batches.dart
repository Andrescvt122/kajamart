// lib/screens/product_batches.dart
import 'package:flutter/material.dart';
import '../models/product.dart';
import '../models/batch.dart';

class ProductBatchesScreen extends StatelessWidget {
  const ProductBatchesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Recibe el producto seleccionado desde la pantalla anterior
    final args = ModalRoute.of(context)!.settings.arguments;
    if (args == null || args is! Product) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: const Center(child: Text('No se recibió un producto válido')),
      );
    }
    final Product product = args;

    return Scaffold(
      appBar: AppBar(
        title: Text('Lotes / Detalles de: ${product.name}'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Producto ID: ${product.id}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(minWidth: 900),
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('ID Detalle')),
                      DataColumn(label: Text('Código de barras')),
                      DataColumn(label: Text('Fecha de vencimiento')),
                      DataColumn(label: Text('Cantidad')),
                      DataColumn(label: Text('Stock consumido')),
                      DataColumn(label: Text('Precio')),
                    ],
                    rows: product.batches.cast<Batch>().map((b) {
                      return DataRow(
                        onSelectChanged: (bool? selected) {
                          if (selected == true) {
                            Navigator.pushNamed(
                              context,
                              '/detail',
                              arguments: {
                                'product': product,
                                'batch': b,
                              },
                            );
                          }
                        },
                        cells: [
                          DataCell(Text(b.idDetalle)),
                          DataCell(Text(b.barcode)),
                          DataCell(Text(
                            b.expiryDate.toIso8601String().split('T')[0],
                          )),
                          DataCell(Text(b.quantity.toString())),
                          DataCell(Text(b.consumedStock.toString())),
                          DataCell(Text('\$${b.price.toStringAsFixed(0)}')),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
