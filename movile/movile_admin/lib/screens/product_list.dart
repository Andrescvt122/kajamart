import 'package:flutter/material.dart';
import '../models/product.dart';

class ProductListScreen extends StatelessWidget {
  final List<Product> products;

  const ProductListScreen({Key? key, required this.products}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Productos - Admin')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(12),
        scrollDirection: Axis.horizontal,
        child: ConstrainedBox(
          constraints: BoxConstraints(minWidth: 900),
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Imagen')),
              DataColumn(label: Text('Nombre')),
              DataColumn(label: Text('Categoría')),
              DataColumn(label: Text('Stock Actual')),
              DataColumn(label: Text('Stock Mínimo')),
              DataColumn(label: Text('Stock Máximo')),
              DataColumn(label: Text('Precio')),
              DataColumn(label: Text('Estado')),
            ],
            rows: products.map((p) {
              return DataRow(
                onSelectChanged: (_) {
                  Navigator.pushNamed(context, '/batches', arguments: p);
                },
                cells: [
                  DataCell(
                    Container(
                      width: 48,
                      height: 48,
                      child: Image.network(
                        p.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Icon(Icons.image),
                      ),
                    ),
                  ),
                  DataCell(Text(p.name)),
                  DataCell(Text(p.category)),
                  DataCell(Text(p.currentStock.toString())),
                  DataCell(Text(p.minStock.toString())),
                  DataCell(Text(p.maxStock.toString())),
                  DataCell(Text('\$${p.price.toStringAsFixed(0)}')),
                  DataCell(Text(p.status)),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
