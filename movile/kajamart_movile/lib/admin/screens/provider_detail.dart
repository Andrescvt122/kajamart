// lib/screens/provider_detail.dart
import 'package:flutter/material.dart';
import '../models/provider.dart';
import '../models/provider_category.dart';
import '../constants/app_constants.dart';

class ProviderDetailScreen extends StatefulWidget {
  final Provider? provider;

  const ProviderDetailScreen({Key? key, this.provider}) : super(key: key);

  @override
  State<ProviderDetailScreen> createState() => _ProviderDetailScreenState();
}

class _ProviderDetailScreenState extends State<ProviderDetailScreen> {
  late Provider provider;
  String _searchQuery = "";
  int _currentPage = 0;
  final int _itemsPerPage = 5;
  bool _showAllCategories = false;

  @override
  void initState() {
    super.initState();
    // Si no se pasa un proveedor, intentar obtenerlo de los argumentos de la ruta
    provider = widget.provider ?? ModalRoute.of(context)!.settings.arguments as Provider;
  }

  List<ProviderCategory> get filteredCategories {
    if (_searchQuery.isEmpty) {
      return provider.categories;
    }
    return provider.categories
        .where((cat) =>
            cat.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            cat.description.toLowerCase().contains(_searchQuery.toLowerCase()))
        .toList();
  }

  List<ProviderCategory> get paginatedCategories {
    final startIndex = _currentPage * _itemsPerPage;
    final endIndex = startIndex + _itemsPerPage;
    return filteredCategories.sublist(
      startIndex,
      endIndex > filteredCategories.length ? filteredCategories.length : endIndex,
    );
  }

  int get totalPages => (filteredCategories.length / _itemsPerPage).ceil();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppConstants.secondaryColor,
        elevation: 0,
        title: Text(
          'Detalle Proveedor',
          style: TextStyle(
            color: AppConstants.textDarkColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppConstants.textDarkColor),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Información básica del proveedor
            _buildProviderHeader(),
            const SizedBox(height: 20),

            // Información detallada
            _buildProviderInfo(),
            const SizedBox(height: 20),

            // Botón para mostrar categorías
            _buildCategoriesButton(),
            const SizedBox(height: 16),

            // Sección de categorías
            if (_showAllCategories) _buildCategoriesSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildProviderHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            provider.name,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppConstants.textDarkColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'NIT: ${provider.nit}',
            style: TextStyle(
              fontSize: 14,
              color: AppConstants.textLightColor,
            ),
          ),
          const SizedBox(height: 8),
          Container(
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
        ],
      ),
    );
  }

  Widget _buildProviderInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Información de Contacto',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppConstants.textDarkColor,
            ),
          ),
          const SizedBox(height: 12),
          _buildInfoRow('Contacto', provider.contactName),
          _buildInfoRow('Teléfono', provider.phone),
          if (provider.email != null) _buildInfoRow('Email', provider.email!),
          if (provider.address != null) _buildInfoRow('Dirección', provider.address!),
          if (provider.registrationDate != null)
            _buildInfoRow('Fecha de Registro',
                '${provider.registrationDate!.day}/${provider.registrationDate!.month}/${provider.registrationDate!.year}'),
          if (provider.averageRating != null)
            _buildInfoRow('Calificación', '${provider.averageRating} ⭐'),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: AppConstants.textDarkColor,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: AppConstants.textLightColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoriesButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () {
          setState(() {
            _showAllCategories = !_showAllCategories;
          });
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppConstants.primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: Text(
          _showAllCategories ? 'Ocultar Categorías' : 'Ver Categorías (${provider.categories.length})',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  Widget _buildCategoriesSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Buscador de categorías
          TextField(
            onChanged: (value) {
              setState(() {
                _searchQuery = value;
                _currentPage = 0; // Reset a primera página cuando se busca
              });
            },
            decoration: InputDecoration(
              hintText: "Buscar categorías...",
              prefixIcon: Icon(Icons.search, color: AppConstants.textLightColor),
              filled: true,
              fillColor: AppConstants.backgroundColor,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: AppConstants.secondaryColor),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: AppConstants.textLightColor),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Lista de categorías
          if (filteredCategories.isEmpty)
            Center(
              child: Text(
                'No se encontraron categorías',
                style: TextStyle(color: AppConstants.textLightColor),
              ),
            )
          else
            Column(
              children: [
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: paginatedCategories.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (context, index) {
                    final category = paginatedCategories[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: AppConstants.secondaryColor,
                        child: Text(
                          category.name[0].toUpperCase(),
                          style: TextStyle(
                            color: AppConstants.textDarkColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      title: Text(
                        category.name,
                        style: TextStyle(
                          color: AppConstants.textDarkColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      subtitle: Text(
                        category.description,
                        style: TextStyle(color: AppConstants.textLightColor),
                      ),
                    );
                  },
                ),

                // Paginador
                if (totalPages > 1)
                  Container(
                    margin: const EdgeInsets.only(top: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          onPressed: _currentPage > 0
                              ? () => setState(() => _currentPage--)
                              : null,
                          icon: Icon(Icons.arrow_back, color: AppConstants.textLightColor),
                        ),
                        const SizedBox(width: 16),
                        Text(
                          'Página ${_currentPage + 1} de $totalPages',
                          style: TextStyle(color: AppConstants.textDarkColor),
                        ),
                        const SizedBox(width: 16),
                        IconButton(
                          onPressed: _currentPage < totalPages - 1
                              ? () => setState(() => _currentPage++)
                              : null,
                          icon: Icon(Icons.arrow_forward, color: AppConstants.textLightColor),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}
