import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class CategoryProductsScreen extends StatefulWidget {
  const CategoryProductsScreen({
    super.key,
    required this.categoryId,
    required this.categoryName,
    this.categoryDescription,
  });

  final int categoryId;
  final String categoryName;
  final String? categoryDescription;

  @override
  State<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  late Future<List<_Product>> _productsFuture;

  @override
  void initState() {
    super.initState();
    _productsFuture = _fetchProducts();
  }

  Future<List<_Product>> _fetchProducts() async {
    try {
      final http.Response response = await http.get(
        Uri.parse(
          'http://localhost:3000/kajamart/api/products/category?q=${widget.categoryId}',
        ),
      );

      if (response.statusCode == 200) {
        final dynamic decodedBody = jsonDecode(response.body);
        final List<dynamic> productList;

        if (decodedBody is List) {
          productList = decodedBody;
        } else if (decodedBody is Map<String, dynamic>) {
          final dynamic data = decodedBody['data'] ?? decodedBody['products'];
          if (data is List) {
            productList = data;
          } else if (decodedBody.containsKey('id_producto')) {
            productList = [decodedBody];
          } else {
            throw const FormatException();
          }
        } else {
          throw const FormatException();
        }

        return productList
            .map((dynamic item) => _Product.fromJson(item as Map<String, dynamic>))
            .toList();
      }

      throw Exception(
        'No se pudieron cargar los productos. Código: ${response.statusCode}',
      );
    } catch (error) {
      throw Exception('Ocurrió un error al cargar los productos.');
    }
  }

  Future<void> _reload() async {
    setState(() {
      _productsFuture = _fetchProducts();
    });
    await _productsFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(136, 135, 234, 129),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.categoryName),
            if (widget.categoryDescription != null &&
                widget.categoryDescription!.trim().isNotEmpty)
              Text(
                widget.categoryDescription!,
                style: const TextStyle(fontSize: 12),
              ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _reload,
        child: FutureBuilder<List<_Product>>(
          future: _productsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return _ErrorView(
                message: snapshot.error?.toString() ??
                    'Ocurrió un error al cargar los productos.',
                onRetry: _reload,
              );
            }

            final List<_Product> products = snapshot.data ?? <_Product>[];

            if (products.isEmpty) {
              return _EmptyView(onRetry: _reload);
            }

            return GridView.builder(
              padding: const EdgeInsets.all(12),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.7,
              ),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final _Product product = products[index];
                return _ProductCard(product: product);
              },
            );
          },
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});

  final _Product product;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: product.imageUrl != null && product.imageUrl!.isNotEmpty
                  ? Image.network(
                      product.imageUrl!,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => _ImagePlaceholder(
                        name: product.name,
                      ),
                    )
                  : _ImagePlaceholder(name: product.name),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Text(
                  product.description,
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    fontSize: 12,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),
                Text(
                  product.price,
                  style: const TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ImagePlaceholder extends StatelessWidget {
  const _ImagePlaceholder({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.shade200,
      alignment: Alignment.center,
      child: Text(
        name,
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 12, color: Colors.black54),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView({required this.onRetry});

  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            const Text(
              'No hay productos disponibles para esta categoría.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Recargar'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});

  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Product {
  const _Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.imageUrl,
  });

  final int id;
  final String name;
  final String description;
  final String price;
  final String? imageUrl;

  factory _Product.fromJson(Map<String, dynamic> json) {
    final dynamic idValue = json['id_producto'];
    final dynamic priceValue = json['precio_venta'];

    return _Product(
      id: idValue is int ? idValue : int.tryParse(idValue?.toString() ?? '') ?? 0,
      name: json['nombre']?.toString() ?? '',
      description: json['descripcion']?.toString() ?? '',
      price: priceValue == null ? 'S/D' : '\$${priceValue.toString()}',
      imageUrl: json['url_imagen']?.toString(),
    );
  }
}
