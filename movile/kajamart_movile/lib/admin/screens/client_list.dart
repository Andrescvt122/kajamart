// lib/screens/client_list.dart
import 'package:flutter/material.dart';
import '../models/client.dart';
import '../constants/app_constants.dart';

class ClientListScreen extends StatefulWidget {
  final List<Client> clients;

  const ClientListScreen({Key? key, required this.clients}) : super(key: key);

  @override
  State<ClientListScreen> createState() => _ClientListScreenState();
}

class _ClientListScreenState extends State<ClientListScreen> {
  String _selectedFilter = "Todos";
  String _searchQuery = "";

  List<String> get filters => ["Todos", "Activos", "Inactivos"];

  List<Client> get filteredClients {
    List<Client> list;

    switch (_selectedFilter) {
      case "Activos":
        list = widget.clients
            .where((c) => c.status == ClientStatus.activo)
            .toList();
        break;
      case "Inactivos":
        list = widget.clients
            .where((c) => c.status == ClientStatus.inactivo)
            .toList();
        break;
      default:
        list = widget.clients;
    }

    // Filtro de búsqueda
    if (_searchQuery.isNotEmpty) {
      list = list
          .where(
            (c) =>
                c.fullName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                c.email.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                c.phone.toLowerCase().contains(_searchQuery.toLowerCase()),
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
        centerTitle: true,
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
                hintText: "Buscar cliente...",
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
          // Lista de clientes
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: filteredClients.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final client = filteredClients[index];
                return GestureDetector(
                  onTap: () {
                    // TODO: Navegar a pantalla de detalle del cliente
                    _showClientDetailModal(context, client);
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
                        // Imagen de perfil
                        ClipRRect(
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(12),
                            bottomLeft: Radius.circular(12),
                          ),
                          child: client.imageUrl != null
                              ? Image.network(
                                  client.imageUrl!,
                                  width: 80,
                                  height: 80,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => _buildPlaceholderAvatar(),
                                )
                              : _buildPlaceholderAvatar(),
                        ),
                        const SizedBox(width: 12),
                        // Información del cliente
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  client.fullName,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: AppConstants.textDarkColor,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.email,
                                      size: 14,
                                      color: Colors.grey[600],
                                    ),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        client.email,
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: AppConstants.textLightColor,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.phone,
                                      size: 14,
                                      color: Colors.grey[600],
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      client.phone,
                                      style: TextStyle(
                                        color: Colors.grey[700],
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                if (client.totalSpent != null)
                                  Text(
                                    'Total gastado: \$${client.totalSpent!.toStringAsFixed(0)}',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: AppConstants.textLightColor,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                if (client.totalOrders != null)
                                  Text(
                                    '${client.totalOrders} pedidos realizados',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: AppConstants.textLightColor,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                        // Estado y botón
                        Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Estado
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Color(client.status.colorValue).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Color(client.status.colorValue),
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  client.status.displayName,
                                  style: TextStyle(
                                    color: Color(client.status.colorValue),
                                    fontWeight: FontWeight.w600,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                            ),
                            // Botón Ver detalles
                            Padding(
                              padding: const EdgeInsets.only(right: 8, bottom: 8),
                              child: ElevatedButton(
                                onPressed: () {
                                  _showClientDetailModal(context, client);
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppConstants.primaryColor,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  minimumSize: const Size(80, 30),
                                ),
                                child: const Text(
                                  'Ver detalles',
                                  style: TextStyle(fontSize: 11),
                                ),
                              ),
                            ),
                          ],
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

  Widget _buildPlaceholderAvatar() {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        color: AppConstants.secondaryColor.withOpacity(0.3),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(12),
          bottomLeft: Radius.circular(12),
        ),
      ),
      child: Icon(
        Icons.person,
        color: AppConstants.textLightColor,
        size: 40,
      ),
    );
  }

  void _showClientDetailModal(BuildContext context, Client client) {
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
              // Header con imagen y nombre
              Row(
                children: [
                  client.imageUrl != null
                      ? CircleAvatar(
                          radius: 40,
                          backgroundImage: NetworkImage(client.imageUrl!),
                          onBackgroundImageError: (_, __) => null,
                        )
                      : CircleAvatar(
                          radius: 40,
                          backgroundColor: AppConstants.secondaryColor.withOpacity(0.3),
                          child: Icon(
                            Icons.person,
                            color: AppConstants.textLightColor,
                            size: 40,
                          ),
                        ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          client.fullName,
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppConstants.textDarkColor,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Color(client.status.colorValue).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Color(client.status.colorValue),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            client.status.displayName,
                            style: TextStyle(
                              color: Color(client.status.colorValue),
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
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
                      _buildDetailSection('Información Personal', [
                        _buildDetailItem('Email', client.email),
                        _buildDetailItem('Teléfono', client.phone),
                        if (client.address != null) _buildDetailItem('Dirección', client.address!),
                        if (client.documentType != null && client.documentNumber != null)
                          _buildDetailItem('${client.documentType}', client.documentNumber!),
                      ]),
                      const SizedBox(height: 20),
                      if (client.totalSpent != null || client.totalOrders != null)
                        _buildDetailSection('Estadísticas', [
                          if (client.totalSpent != null)
                            _buildDetailItem('Total Gastado', '\$${client.totalSpent!.toStringAsFixed(0)}'),
                          if (client.totalOrders != null)
                            _buildDetailItem('Total Pedidos', '${client.totalOrders}'),
                        ]),
                      const SizedBox(height: 20),
                      if (client.registrationDate != null)
                        _buildDetailSection('Información Adicional', [
                          _buildDetailItem('Fecha de Registro',
                              '${client.registrationDate!.day}/${client.registrationDate!.month}/${client.registrationDate!.year}'),
                        ]),
                    ],
                  ),
                ),
              ),
              // Botones de acción
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
}
