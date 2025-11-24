import 'package:flutter/material.dart';
import 'package:movile_admin/constants/app_constants.dart';
import 'package:provider/provider.dart';

import '../models/product.dart';
import '../services/product_service.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({Key? key}) : super(key: key);

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  String _selectedFilter = "Todos";
  String _searchQuery = "";

  List<String> get filters => ["Todas", "Activos", "Inactivos", "Stock bajo"];

  List<Product> _filterProducts(List<Product> products) {
    List<Product> list;

    switch (_selectedFilter) {
      case "Activos":
        list =
            products.where((p) => p.status.toLowerCase() == "activo").toList();
        break;
      case "Inactivos":
        list = products
            .where((p) => p.status.toLowerCase() != "activo")
            .toList();
        break;
      case "Stock bajo":
        list = products
            .where((p) => p.currentStock <= p.minStock)
            .toList();
        break;
      default:
        list = products;
    }

    if (_searchQuery.isNotEmpty) {
      list = list
          .where(
            (p) =>
                p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                p.category.toLowerCase().contains(_searchQuery.toLowerCase()),
          )
          .toList();
    }

    return list;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppConstants.secondaryColor,
        elevation: 0,
        title: const Text(
          'Productos',
          style: TextStyle(
            color: Color(0xff343b45),
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: () => context.read<ProductService>().fetchProducts(),
            icon: const Icon(Icons.refresh, color: Color(0xff343b45)),
          ),
        ],
      ),
      body: Consumer<ProductService>(
        builder: (context, productService, _) {
          if (productService.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (productService.errorMessage != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      productService.errorMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Color(0xff343b45)),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => productService.fetchProducts(),
                      child: const Text('Reintentar'),
                    ),
                  ],
                ),
              ),
            );
          }

          final filteredProducts = _filterProducts(productService.products);

          if (filteredProducts.isEmpty) {
            return const Center(
              child: Text(
                'No hay productos para mostrar',
                style: TextStyle(color: Color(0xff626762)),
              ),
            );
          }

          return Column(
            children: [
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: TextField(
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                  decoration: InputDecoration(
                    hintText: "Buscar producto...",
                    prefixIcon:
                        const Icon(Icons.search, color: Color(0xff626762)),
                    filled: true,
                    fillColor: AppConstants.backgroundColor,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 0,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          const BorderSide(color: AppConstants.secondaryColor),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          const BorderSide(color: AppConstants.primaryColor),
                    ),
                  ),
                ),
              ),
              SizedBox(
                height: 50,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  itemCount: filters.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final filter = filters[index];
                    final isSelected = filter == _selectedFilter;
                    return ChoiceChip(
                      label: Text(
                        filter,
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : const Color(0xff343b45),
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: AppConstants.primaryColor,
                      backgroundColor:
                          AppConstants.secondaryColor.withOpacity(0.5),
                      onSelected: (_) {
                        setState(() {
                          _selectedFilter = filter;
                        });
                      },
                    );
                  },
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: filteredProducts.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final p = filteredProducts[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.pushNamed(context, '/batches', arguments: p);
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color:
                                  AppConstants.secondaryColor.withOpacity(0.6)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 5,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            ClipRRect(
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(12),
                                bottomLeft: Radius.circular(12),
                              ),
                              child: Image.network(
                                p.imageUrl,
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  width: 100,
                                  height: 100,
                                  color: AppConstants.secondaryColor
                                      .withOpacity(0.5),
                                  child: const Icon(
                                    Icons.image,
                                    color: Color(0xff626762),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 8),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      p.name,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        color: Color(0xff343b45),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      p.category,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: Color(0xff626762),
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: p.status.toLowerCase() ==
                                                    "activo"
                                                ? Colors.green[50]
                                                : Colors.red[50],
                                            borderRadius:
                                                BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            p.status,
                                            style: TextStyle(
                                              color: p.status.toLowerCase() ==
                                                      "activo"
                                                  ? Colors.green[700]
                                                  : Colors.red[700],
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        const Icon(Icons.inventory,
                                            size: 16, color: Color(0xff626762)),
                                        const SizedBox(width: 4),
                                        Text(
                                          "Stock: ${p.currentStock}",
                                          style: const TextStyle(
                                              color: Color(0xff626762)),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    "\$${p.price.toStringAsFixed(0)}",
                                    style: const TextStyle(
                                      color: AppConstants.primaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: p.currentStock <= p.minStock
                                          ? Colors.red[50]
                                          : AppConstants.secondaryColor
                                              .withOpacity(0.5),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      p.currentStock <= p.minStock
                                          ? "Stock bajo"
                                          : "Stock OK",
                                      style: TextStyle(
                                        color: p.currentStock <= p.minStock
                                            ? Colors.red[700]
                                            : const Color(0xff343b45),
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                    );
                  },
                ),
              )
            ],
          );
        },
      ),
    );
  }
}
