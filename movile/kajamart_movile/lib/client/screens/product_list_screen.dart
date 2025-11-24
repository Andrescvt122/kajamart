import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'product_screen.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  _ProductListScreenState createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final String _baseUrl = 'http://localhost:3000/kajamart/api';
  final List<Map<String, dynamic>> products = [];
  bool _isLoading = true;
  String? _errorMessage;
  String searchQuery = "";
  String sortOption = "Relevancia";
  String statusFilter = "Todos";
  bool isPriceAsc = true; // 🔹 controla la dirección del orden de precio

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await http.get(Uri.parse('$_baseUrl/products'));

      if (response.statusCode == 200) {
        final dynamic decodedBody = jsonDecode(response.body);

        final List<dynamic> rawProducts;
        if (decodedBody is List) {
          rawProducts = decodedBody;
        } else if (decodedBody is Map<String, dynamic>) {
          final dynamic data = decodedBody['data'] ?? decodedBody['products'];
          if (data is List) {
            rawProducts = data;
          } else if (decodedBody.containsKey('id_producto')) {
            rawProducts = [decodedBody];
          } else {
            throw const FormatException('Formato desconocido de productos');
          }
        } else {
          throw const FormatException('Formato desconocido de productos');
        }

        setState(() {
          products
            ..clear()
            ..addAll(
              rawProducts
                  .whereType<Map<String, dynamic>>()
                  .map(_mapProductFromJson),
            );
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage =
              'No se pudieron cargar los productos. Código: ${response.statusCode}';
          _isLoading = false;
        });
      }
    } catch (_) {
      setState(() {
        _errorMessage = 'Ocurrió un error al cargar los productos.';
        _isLoading = false;
      });
    }
  }

  Map<String, dynamic> _mapProductFromJson(Map<String, dynamic> json) {
    final bool isActive = json['estado'] == true ||
        (json['status']?.toString().toLowerCase() == 'activo');
    final dynamic categoryData = json['categorias'];
    final String? categoryName = json['categoria'] ??
        (categoryData is Map<String, dynamic>
            ? categoryData['nombre_categoria']?.toString()
            : null);

    return {
      'id': json['id_producto'] ?? json['id'],
      'name': json['nombre'] ?? json['name'] ?? 'Producto',
      'status': isActive ? 'Activo' : 'Inactivo',
      'category': categoryName ?? json['category'] ?? 'Sin categoría',
      'price': json['precio_venta'] ?? json['price'] ?? 0,
      'image': json['url_imagen'] ?? json['image'] ?? '',
      'description': json['descripcion'] ?? json['description'],
      'stock': json['stock_actual'] ?? json['stock'] ?? 0,
    };
  }

  String _formatPrice(dynamic value) {
    final num price = value is num ? value : num.tryParse(value.toString()) ?? 0;
    return 'COP ${price.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    // Filtrar productos
    List<Map<String, dynamic>> filteredProducts = products.where((product) {
      final matchesSearch = product["name"]
              .toLowerCase()
              .contains(searchQuery.toLowerCase()) ||
          product["category"]
              .toLowerCase()
              .contains(searchQuery.toLowerCase());

      final matchesStatus = statusFilter == "Todos" ||
          product["status"].toLowerCase() == statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    }).toList();

    // 🔹 Ordenar
    if (sortOption == "precio") {
      filteredProducts.sort((a, b) {
        final aPrice = double.parse(a["price"].toString());
        final bPrice = double.parse(b["price"].toString());
        return isPriceAsc ? aPrice.compareTo(bPrice) : bPrice.compareTo(aPrice);
      });
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(136, 135, 234, 129),
        title: Container(
          height: 40,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: TextField(
            onChanged: (value) {
              setState(() {
                searchQuery = value;
              });
            },
            decoration: InputDecoration(
              hintText: "Buscar en Kajamart...",
              prefixIcon: Icon(Icons.search, color: Colors.grey),
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(vertical: 10),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // 🔹 Barra de filtros
          TweenAnimationBuilder(
            duration: Duration(milliseconds: 500),
            curve: Curves.easeOut,
            tween: Tween<double>(begin: -50, end: 0),
            builder: (context, double value, child) {
              return Transform.translate(
                offset: Offset(0, value),
                child: Opacity(opacity: 1 - (value.abs() / 50), child: child),
              );
            },
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5)],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Expanded(child: buildChip("Relevancia", isSort: true)),
                  SizedBox(width: 6),
                  Expanded(child: buildPriceChip()),
                  SizedBox(width: 6),
                  Expanded(child: buildChip("Activo", isSort: false)),
                  SizedBox(width: 6),
                  Expanded(child: buildChip("Inactivo", isSort: false)),
                ],
              ),
            ),
          ),

          // 🔹 Lista de productos
          Expanded(
            child: AnimatedSwitcher(
              duration: Duration(milliseconds: 400),
              switchInCurve: Curves.easeIn,
              switchOutCurve: Curves.easeOut,
              child: Builder(
                builder: (_) {
                  if (_isLoading) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (_errorMessage != null) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _errorMessage!,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton.icon(
                              onPressed: _fetchProducts,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  if (filteredProducts.isEmpty) {
                    return const Center(
                      child: Text('No hay productos para mostrar'),
                    );
                  }

                  return GridView.builder(
                    key: ValueKey(filteredProducts.length),
                    padding: EdgeInsets.all(8),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                      childAspectRatio: 0.6,
                    ),
                    itemCount: filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = filteredProducts[index];
                      return TweenAnimationBuilder(
                        tween: Tween<double>(begin: 0, end: 1),
                        duration: Duration(milliseconds: 300 + (index * 100)),
                        curve: Curves.easeOut,
                        builder: (context, double value, child) {
                          return Opacity(
                            opacity: value,
                            child: Transform.translate(
                              offset: Offset(0, 40 * (1 - value)),
                              child: child,
                            ),
                          );
                        },
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(10),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ProductScreen(product: product),
                                ),
                              );
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black12,
                                    blurRadius: 4,
                                    offset: Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Expanded(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.vertical(
                                        top: Radius.circular(10),
                                      ),
                                      child: Hero(
                                        tag: 'product-image-${product["id"]}',
                                        child:
                                            _buildProductImage(product["image"] ?? ''),
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: EdgeInsets.all(6),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          product["name"],
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 13,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        SizedBox(height: 4),
                                        Text(
                                          _formatPrice(product["price"]),
                                          style: TextStyle(
                                            color: const Color.fromARGB(255, 0, 0, 0),
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        SizedBox(height: 2),
                                        Row(
                                          children: [
                                            Icon(
                                              Icons.circle,
                                              size: 10,
                                              color: product["status"] == "Activo"
                                                  ? Colors.green
                                                  : Colors.red,
                                            ),
                                            SizedBox(width: 6),
                                            Text(
                                              product["status"],
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: product["status"] == "Activo"
                                                    ? Colors.green.shade700
                                                    : Colors.red.shade400,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildChip(String label, {bool isSort = true}) {
    bool isSelected = isSort
        ? sortOption == label.toLowerCase()
        : statusFilter.toLowerCase() == label.toLowerCase();

    return FilterChip(
      label: Center(child: Text(label)),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          if (isSort) {
            sortOption = label.toLowerCase();
          } else {
            statusFilter = isSelected ? "Todos" : label;
          }
        });
      },
      backgroundColor: Colors.grey.shade200,
      selectedColor: Colors.green.shade100,
      checkmarkColor: Colors.green,
      labelStyle: TextStyle(fontWeight: FontWeight.w500),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    );
  }

  Widget buildPriceChip() {
    bool isSelected = sortOption == "precio";

    return FilterChip(
      label: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.max,
        children: [
          Text("Precio"),
          if (isSelected)
            Icon(
              isPriceAsc ? Icons.arrow_upward : Icons.arrow_downward,
              size: 18,
              color: Colors.green,
            ),
        ],
      ),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          if (isSelected) {
            isPriceAsc = !isPriceAsc; // 🔄 cambia la dirección
          } else {
            sortOption = "precio";
            isPriceAsc = true;
          }
        });
      },
      backgroundColor: Colors.grey.shade200,
      selectedColor: const Color.fromARGB(255, 255, 255, 255),
      checkmarkColor: Colors.green,
      labelStyle: TextStyle(fontWeight: FontWeight.w500),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    );
  }

  Widget _buildProductImage(String image) {
    if (image.isEmpty) {
      return Container(
        color: Colors.grey.shade200,
        child: const Icon(Icons.image_not_supported, color: Colors.grey),
      );
    }

    if (image.startsWith('data:image')) {
      final base64Data = image.split(',').last;
      return Image.memory(
        base64Decode(base64Data),
        fit: BoxFit.cover,
      );
    }

    return Image.network(
      image,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          color: Colors.grey.shade200,
          child: const Icon(Icons.image_not_supported, color: Colors.grey),
        );
      },
    );
  }
}
