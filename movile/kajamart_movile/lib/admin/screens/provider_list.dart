// lib/screens/provider_list.dart
import 'package:flutter/material.dart';

import '../constants/app_constants.dart';
import '../models/provider.dart';
import '../services/provider_service.dart';

class ProviderListScreen extends StatefulWidget {
  const ProviderListScreen({super.key});

  @override
  State<ProviderListScreen> createState() => _ProviderListScreenState();
}

class _ProviderListScreenState extends State<ProviderListScreen> {
  late final ProviderService _providerService;
  String _selectedFilter = 'Todos';
  String _searchQuery = '';

  List<String> get filters => ['Todos', 'Activos', 'Inactivos'];

  @override
  void initState() {
    super.initState();
    _providerService = ProviderService();
    _providerService.fetchProviders();
  }

  @override
  void dispose() {
    _providerService.dispose();
    super.dispose();
  }

  List<Provider> get _providers => _providerService.providers;

  List<Provider> get filteredProviders {
    Iterable<Provider> list = _providers;

    switch (_selectedFilter) {
      case 'Activos':
        list = list.where((p) => p.status == ProviderStatus.activo);
        break;
      case 'Inactivos':
        list = list.where((p) => p.status == ProviderStatus.inactivo);
        break;
      default:
        break;
    }

    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      list = list.where(
        (p) => p.name.toLowerCase().contains(query) ||
            p.contactName.toLowerCase().contains(query) ||
            p.nit.toLowerCase().contains(query),
      );
    }

    return list.toList();
  }

  Future<void> _onRefresh() async {
    await _providerService.fetchProviders();
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
      body: AnimatedBuilder(
        animation: _providerService,
        builder: (context, _) {
          if (_providerService.isLoading && _providers.isEmpty) {
            return _buildLoadingView();
          }

          if (_providerService.errorMessage != null && _providers.isEmpty) {
            return _buildErrorView();
          }

          return RefreshIndicator(
            onRefresh: _onRefresh,
            color: AppConstants.primaryColor,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.zero,
              children: [
                if (_providerService.isLoading)
                  const LinearProgressIndicator(minHeight: 2),
                const SizedBox(height: 12),
                _buildSearchBar(),
                _buildFilterChips(),
                const Divider(height: 1),
                if (_providerService.errorMessage != null)
                  _buildInlineError(_providerService.errorMessage!),
                if (filteredProviders.isEmpty)
                  _buildEmptyState()
                else
                  ..._buildProviderCards(filteredProviders),
                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildLoadingView() {
    return Center(
      child: CircularProgressIndicator(
        color: AppConstants.primaryColor,
      ),
    );
  }

  Widget _buildErrorView() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.wifi_off, size: 64, color: AppConstants.textLightColor),
          const SizedBox(height: 16),
          Text(
            _providerService.errorMessage ?? 'Ocurrió un error inesperado.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppConstants.textDarkColor,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _onRefresh,
            icon: const Icon(Icons.refresh),
            label: const Text('Reintentar'),
          ),
        ],
      ),
    );
  }

  Widget _buildInlineError(String message) {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.redAccent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline, color: Colors.redAccent),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: Colors.redAccent.shade700,
              ),
            ),
          ),
          TextButton(
            onPressed: _onRefresh,
            child: const Text('Actualizar'),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: TextField(
        onChanged: (value) {
          setState(() {
            _searchQuery = value;
          });
        },
        decoration: InputDecoration(
          hintText: 'Buscar proveedor...',
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
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
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
                color: isSelected ? Colors.white : AppConstants.textDarkColor,
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
    );
  }

  Widget _buildEmptyState() {
    final hasActiveFilter =
        _selectedFilter != 'Todos' || _searchQuery.trim().isNotEmpty;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
      child: Column(
        children: [
          Icon(Icons.inventory_2, size: 60, color: AppConstants.textLightColor),
          const SizedBox(height: 16),
          Text(
            hasActiveFilter
                ? 'No se encontraron proveedores con los filtros aplicados.'
                : 'No hay proveedores registrados.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              color: AppConstants.textDarkColor,
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildProviderCards(List<Provider> providers) {
    final widgets = <Widget>[];
    for (final provider in providers) {
      widgets.add(
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: GestureDetector(
            onTap: () {
              Navigator.pushNamed(
                context,
                '/provider-detail',
                arguments: provider,
              );
            },
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppConstants.secondaryColor.withOpacity(0.5),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
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
                          const SizedBox(height: 4),
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
                              Expanded(
                                child: Text(
                                  provider.phone,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppConstants.textLightColor,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            children: provider.categories.isNotEmpty
                                ? provider.categories
                                    .map(
                                      (category) => Chip(
                                        label: Text(
                                          category.name,
                                          style: const TextStyle(fontSize: 11),
                                        ),
                                        backgroundColor: AppConstants.secondaryColor
                                            .withOpacity(0.2),
                                      ),
                                    )
                                    .toList()
                                : [
                                    Chip(
                                      label: const Text('Sin categorías'),
                                      backgroundColor:
                                          AppConstants.secondaryColor.withOpacity(0.2),
                                    ),
                                  ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color:
                            Color(provider.status.colorValue).withOpacity(0.1),
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
              ),
            ),
          ),
        ),
      );
    }
    return widgets;
  }
}
