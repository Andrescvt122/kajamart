import 'package:flutter/material.dart';
import 'package:movile_admin/constants/app_constants.dart';
import '../models/product.dart';

class ProductListScreen extends StatefulWidget {
  final List<Product> products;

  const ProductListScreen({Key? key, required this.products}) : super(key: key);

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  String _selectedFilter = "Todos";
  String _searchQuery = "";

  List<String> get filters => ["Todas", "Activos", "Inactivos", "Stock bajo"];

  List<Product> get filteredProducts {
    List<Product> list;

    switch (_selectedFilter) {
      case "Activos":
        list = widget.products
            .where((p) => p.status.toLowerCase() == "activo")
            .toList();
        break;
      case "Inactivos":
        list = widget.products
            .where((p) => p.status.toLowerCase() != "activo")
            .toList();
        break;
      case "Stock bajo":
        list = widget.products
            .where((p) => p.currentStock <= p.minStock)
            .toList();
        break;
      default:
        list = widget.products;
    }

    // Filtro de búsqueda
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
      backgroundColor: AppConstants.backgroundColor, // Fondo blanco
      backgroundColor: const Color.fromARGB(255, 255, 255, 255), // Fondo suave
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
      ),
      body: Column(
        children: [
          // Barra de búsqueda
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: TextField(
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
              decoration: InputDecoration(
                hintText: "Buscar producto...",
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
          // Filtros tipo Temu
          SizedBox(
            height: 50,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
                  backgroundColor: AppConstants.secondaryColor.withOpacity(0.5),
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
          // Lista de productos
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
                      border: Border.all(color: AppConstants.secondaryColor.withOpacity(0.6)),
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
                        // Imagen ajustada y cuadrada
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
                              color: AppConstants.secondaryColor.withOpacity(0.5),
                              child: const Icon(
                                Icons.image,
                                color: Color(0xff626762),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Info
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
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
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  p.category,
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
                                      "Stock: ${p.currentStock}",
                                      style: TextStyle(
                                        color: Colors.grey[700],
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "\$${p.price.toStringAsFixed(0)}",
                                  style: const TextStyle(
                                    color: AppConstants.primaryColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        // Estado
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text(
                            p.status,
                            style: TextStyle(
                              color: p.status.toLowerCase() == "activo"
                                  ? AppConstants.primaryColor
                                  : Colors.red,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
