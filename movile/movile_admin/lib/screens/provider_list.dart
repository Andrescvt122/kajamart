// lib/screens/provider_list.dart
import 'package:flutter/material.dart';
import '../models/provider.dart';
import '../constants/app_constants.dart';

class ProviderListScreen extends StatefulWidget {
  final List<Provider> providers;

  const ProviderListScreen({Key? key, required this.providers}) : super(key: key);

  @override
  State<ProviderListScreen> createState() => _ProviderListScreenState();
}

class _ProviderListScreenState extends State<ProviderListScreen> {
  String _selectedFilter = "Todos";
  String _searchQuery = "";

  List<String> get filters => ["Todos", "Activos", "Inactivos"];

  List<Provider> get filteredProviders {
    List<Provider> list;

    switch (_selectedFilter) {
      case "Activos":
        list = widget.providers
            .where((p) => p.status == ProviderStatus.activo)
            .toList();
        break;
      case "Inactivos":
        list = widget.providers
            .where((p) => p.status == ProviderStatus.inactivo)
            .toList();
        break;
      default:
        list = widget.providers;
    }

    // Filtro de búsqueda
    if (_searchQuery.isNotEmpty) {
      list = list
          .where(
            (p) =>
                p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                p.contactName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                p.nit.toLowerCase().contains(_searchQuery.toLowerCase()),
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
        title: Text(
          'Proveedores',
          style: TextStyle(
            color: AppConstants.textDarkColor,
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
                hintText: "Buscar proveedor...",
                prefixIcon: Icon(Icons.search, color: AppConstants.textLightColor),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 0,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppConstants.secondaryColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppConstants.textLightColor),
                ),
              ),
            ),
          ),
          // Filtros
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
                          : AppConstants.textDarkColor,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: AppConstants.textLightColor,
                  backgroundColor: AppConstants.secondaryColor.withOpacity(0.3),
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
          // Lista de proveedores
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: filteredProviders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final provider = filteredProviders[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.pushNamed(context, '/provider-detail', arguments: provider);
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppConstants.secondaryColor.withOpacity(0.5)),
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
                        // Imagen
                        ClipRRect(
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(12),
                            bottomLeft: Radius.circular(12),
                          ),
                          child: Image.network(
                            provider.imageUrl ?? 'https://via.placeholder.com/300x200?text=No+Image',
                            width: 100,
                            height: 100,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 100,
                              height: 100,
                              color: AppConstants.secondaryColor.withOpacity(0.3),
                              child: Icon(
                                Icons.business,
                                color: AppConstants.textLightColor,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Información
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  provider.name,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: AppConstants.textDarkColor,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  'NIT: ${provider.nit}',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppConstants.textLightColor,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Contacto: ${provider.contactName}',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppConstants.textLightColor,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.phone,
                                      size: 16,
                                      color: Colors.grey[600],
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      provider.phone,
                                      style: TextStyle(
                                        color: Colors.grey[700],
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  provider.categoriesDisplay,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: AppConstants.textLightColor,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ),
                        // Estado
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Color(provider.status.colorValue).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: Color(provider.status.colorValue),
                                width: 1,
                              ),
                            ),
                            child: Text(
                              provider.status.displayName,
                              style: TextStyle(
                                color: Color(provider.status.colorValue),
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
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
