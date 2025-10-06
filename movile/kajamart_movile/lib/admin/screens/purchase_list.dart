// lib/screens/purchase_list.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/purchase.dart';
import '../constants/app_constants.dart';

class PurchaseListScreen extends StatefulWidget {
  final List<Purchase> purchases;

  const PurchaseListScreen({Key? key, required this.purchases}) : super(key: key);

  @override
  State<PurchaseListScreen> createState() => _PurchaseListScreenState();
}

class _PurchaseListScreenState extends State<PurchaseListScreen> {
  String _selectedFilter = "Recientes";
  String _searchQuery = "";

  List<String> get filters => ["Recientes", "Proveedor", "Estado"];

  List<Purchase> get filteredPurchases {
    List<Purchase> list = List.from(widget.purchases);

    // Filtro de búsqueda
    if (_searchQuery.isNotEmpty) {
      list = list
          .where(
            (purchase) =>
                purchase.id.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                purchase.providerName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                purchase.providerNit.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                purchase.total.toString().contains(_searchQuery),
          )
          .toList();
    }

    // Filtros adicionales según selección
    switch (_selectedFilter) {
      case "Proveedor":
        list.sort((a, b) => a.providerName.compareTo(b.providerName));
        break;
      case "Estado":
        // Ordenar por estado: Completada > Anulada
        list.sort((a, b) {
          const statusOrder = {
            PurchaseStatus.completada: 0,
            PurchaseStatus.anulada: 1,
          };
          return statusOrder[a.status]!.compareTo(statusOrder[b.status]!);
        });
        break;
      default: // Recientes
        list.sort((a, b) => b.date.compareTo(a.date)); // Más reciente primero
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
        toolbarHeight: 20,
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
                hintText: "Buscar compra...",
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
                  selectedColor: AppConstants.primaryColor,
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
          // Lista de compras
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: filteredPurchases.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final purchase = filteredPurchases[index];
                return GestureDetector(
                  onTap: () {
                    _showPurchaseDetailModal(context, purchase);
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
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header con número de compra y estado
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Compra #${purchase.id}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  color: AppConstants.textDarkColor,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Color(purchase.status.colorValue).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Color(purchase.status.colorValue),
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  purchase.status.displayName,
                                  style: TextStyle(
                                    color: Color(purchase.status.colorValue),
                                    fontWeight: FontWeight.w600,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          // Información del proveedor y NIT
                          Row(
                            children: [
                              Icon(
                                Icons.business,
                                size: 16,
                                color: Colors.grey[600],
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  purchase.providerName,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: AppConstants.textDarkColor,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(
                                Icons.assignment_ind,
                                size: 16,
                                color: Colors.grey[600],
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'NIT: ${purchase.providerNit}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppConstants.textLightColor,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Icon(
                                Icons.calendar_today,
                                size: 16,
                                color: Colors.grey[600],
                              ),
                              const SizedBox(width: 4),
                              Text(
                                DateFormat('dd/MM/yyyy').format(purchase.date),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppConstants.textLightColor,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          // Total y productos
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${purchase.products.length} productos',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppConstants.textLightColor,
                                ),
                              ),
                              Text(
                                '\$${purchase.total.toStringAsFixed(0)}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: AppConstants.primaryColor,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // Botón Ver detalles
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () {
                                _showPurchaseDetailModal(context, purchase);
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppConstants.primaryColor,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                              child: const Text(
                                'Ver detalles',
                                style: TextStyle(fontSize: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
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

  void _showPurchaseDetailModal(BuildContext context, Purchase purchase) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(20),
          height: MediaQuery.of(context).size.height * 0.8,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header con número de compra y estado
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Compra #${purchase.id}',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppConstants.textDarkColor,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Color(purchase.status.colorValue).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Color(purchase.status.colorValue),
                        width: 1,
                      ),
                    ),
                    child: Text(
                      purchase.status.displayName,
                      style: TextStyle(
                        color: Color(purchase.status.colorValue),
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Información detallada
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Información del proveedor
                      _buildDetailSection('Información del Proveedor', [
                        _buildDetailItem('Nombre', purchase.providerName),
                        _buildDetailItem('NIT', purchase.providerNit),
                        _buildDetailItem('Fecha', DateFormat('dd/MM/yyyy HH:mm').format(purchase.date)),
                        _buildDetailItem('Total', '\$${purchase.total.toStringAsFixed(0)}'),
                        if (purchase.taxes != null)
                          _buildDetailItem('Impuestos', '\$${purchase.taxes!.toStringAsFixed(0)}'),
                      ]),
                      const SizedBox(height: 20),
                      // Productos comprados
                      _buildDetailSection('Productos Comprados', [
                        ...purchase.products.map((product) => _buildProductItem(product)).toList(),
                      ]),
                      const SizedBox(height: 20),
                      // Observaciones
                      if (purchase.observations != null && purchase.observations!.isNotEmpty)
                        _buildDetailSection('Observaciones', [
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              purchase.observations!,
                              style: TextStyle(
                                fontSize: 14,
                                color: AppConstants.textDarkColor,
                              ),
                            ),
                          ),
                        ]),
                    ],
                  ),
                ),
              ),
              // Botón de acción
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppConstants.primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('Cerrar'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppConstants.textDarkColor,
          ),
        ),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppConstants.textLightColor,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                color: AppConstants.textDarkColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductItem(PurchaseProduct product) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppConstants.textDarkColor,
                  ),
                ),
                Text(
                  '${product.quantity} x \$${product.unitCost.toStringAsFixed(0)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppConstants.textLightColor,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '\$${product.subtotal.toStringAsFixed(0)}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppConstants.primaryColor,
            ),
          ),
        ],
      ),
    );
  }
}
