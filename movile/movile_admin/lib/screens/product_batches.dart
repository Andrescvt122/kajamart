// lib/screens/product_batches.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:movile_admin/constants/app_constants.dart';
import '../models/batch.dart';
import '../models/product.dart';
import '../services/product_service.dart';

class ProductBatchesScreen extends StatefulWidget {
  const ProductBatchesScreen({Key? key}) : super(key: key);

  @override
  State<ProductBatchesScreen> createState() => _ProductBatchesScreenState();
}

class _ProductBatchesScreenState extends State<ProductBatchesScreen> {
  String _searchQuery = "";
  late Product _product;
  bool _initialized = false;
  Future<List<Batch>>? _batchesFuture;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) return;

    final args = ModalRoute.of(context)!.settings.arguments;
    if (args == null || args is! Product) {
      return;
    }

    _product = args;
    _batchesFuture = Provider.of<ProductService>(context, listen: false)
        .fetchProductBatches(_product.id, _product.salePrice);
    _initialized = true;
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized) {
      return Scaffold(
        appBar: AppBar(title: const Text('Lotes')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      backgroundColor: const Color.fromARGB(255, 255, 255, 255),
      appBar: AppBar(
        backgroundColor: AppConstants.secondaryColor, // Verde claro
        elevation: 0,
        title: Text(
          'Lotes de: ${_product.name}',
          style: const TextStyle(
            color: Color(0xff343b45),
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Barra de búsqueda
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
              decoration: InputDecoration(
                hintText: "Buscar lote (ID, código, fecha)...",
                prefixIcon: const Icon(Icons.search, color: Color(0xff626762)),
                filled: true,
                fillColor: AppConstants.backgroundColor,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 0,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppConstants.secondaryColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppConstants.primaryColor),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              'Producto ID: ${_product.id}',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xff343b45),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Lista estilo Temu
          Expanded(
            child: FutureBuilder<List<Batch>>(
              future: _batchesFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'Error al cargar lotes: ${snapshot.error}',
                        style: const TextStyle(color: Colors.red),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                }

                final batches = snapshot.data ?? _product.batches;
                final filteredBatches = batches.where((batch) {
                  final expiry =
                      batch.expiryDate?.toIso8601String().split('T')[0] ?? '';
                  return batch.idDetalle
                          .toString()
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase()) ||
                      batch.barcode
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase()) ||
                      expiry.contains(_searchQuery);
                }).toList();

                if (filteredBatches.isEmpty) {
                  return const Center(
                    child: Text(
                      'No hay lotes registrados para este producto',
                      style: TextStyle(color: Color(0xff343b45)),
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: filteredBatches.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final b = filteredBatches[index];
                    final expiryText =
                        b.expiryDate?.toIso8601String().split('T')[0] ?? '—';
                    return GestureDetector(
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          '/detail',
                          arguments: {'product': _product, 'batch': b},
                        );
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppConstants.secondaryColor.withOpacity(0.6),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 5,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "ID Lote: ${b.idDetalle}",
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: Color(0xff343b45),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "Código: ${b.barcode}",
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xff626762),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "Vence: $expiryText",
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xff626762),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(
                                  Icons.inventory,
                                  size: 16,
                                  color: Colors.grey[600],
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  "Cantidad: ${b.quantity}",
                                  style: TextStyle(
                                    color: Colors.grey[700],
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Icon(
                                  Icons.remove_circle_outline,
                                  size: 16,
                                  color: Colors.redAccent,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  "Consumido: ${b.consumedStock}",
                                  style: TextStyle(
                                    color: Colors.grey[700],
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              "\$${b.price.toStringAsFixed(0)}",
                              style: const TextStyle(
                                color: AppConstants.primaryColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
