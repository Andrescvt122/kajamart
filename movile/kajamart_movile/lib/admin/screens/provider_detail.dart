// lib/screens/provider_detail.dart
import 'package:flutter/material.dart';

import '../constants/app_constants.dart';
import '../models/provider.dart';

class ProviderDetailScreen extends StatefulWidget {
  final Provider? provider;

  const ProviderDetailScreen({Key? key, this.provider}) : super(key: key);

  @override
  State<ProviderDetailScreen> createState() => _ProviderDetailScreenState();
}

class _ProviderDetailScreenState extends State<ProviderDetailScreen> {
  Provider? _provider;
  bool _hasLoadedRouteArgs = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_hasLoadedRouteArgs) return;

    _provider = widget.provider ??
        (ModalRoute.of(context)?.settings.arguments is Provider
            ? ModalRoute.of(context)!.settings.arguments as Provider
            : null);
    _hasLoadedRouteArgs = true;
  }

  @override
  Widget build(BuildContext context) {
    final provider = _provider;

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
      body: provider == null ? _buildEmptyState() : _buildContent(provider),
    );
  }

  Widget _buildContent(Provider provider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(provider),
          const SizedBox(height: 16),
          _buildContactInformation(provider),
          const SizedBox(height: 16),
          _buildAdditionalDetails(provider),
          const SizedBox(height: 16),
          _buildCategories(provider),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.person_off, size: 64, color: AppConstants.textLightColor),
            const SizedBox(height: 16),
            Text(
              'No se encontró información del proveedor.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppConstants.textDarkColor,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(Provider provider) {
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
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: AppConstants.secondaryColor.withOpacity(0.2),
            backgroundImage:
                provider.imageUrl != null ? NetworkImage(provider.imageUrl!) : null,
            child: provider.imageUrl == null
                ? Icon(
                    Icons.store_mall_directory,
                    size: 28,
                    color: AppConstants.secondaryColor,
                  )
                : null,
          ),
          const SizedBox(width: 16),
          Expanded(
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
                const SizedBox(height: 6),
                Text(
                  'NIT: ${provider.nit}',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppConstants.textLightColor,
                  ),
                ),
                const SizedBox(height: 12),
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
          )
        ],
      ),
    );
  }

  Widget _buildContactInformation(Provider provider) {
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
            'Información de contacto',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppConstants.textDarkColor,
            ),
          ),
          const SizedBox(height: 12),
          _buildInfoRow('Contacto', provider.contactName, Icons.person_outline),
          _buildInfoRow('Teléfono', provider.phone, Icons.phone),
          if (provider.email != null && provider.email!.trim().isNotEmpty)
            _buildInfoRow('Correo electrónico', provider.email!, Icons.email_outlined),
          if (provider.address != null && provider.address!.trim().isNotEmpty)
            _buildInfoRow('Dirección', provider.address!, Icons.location_on_outlined),
        ],
      ),
    );
  }

  Widget _buildAdditionalDetails(Provider provider) {
    final registrationDate = provider.registrationDate;
    final rating = provider.averageRating;

    if (registrationDate == null && rating == null) {
      return const SizedBox.shrink();
    }

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
            'Información adicional',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppConstants.textDarkColor,
            ),
          ),
          const SizedBox(height: 12),
          if (registrationDate != null)
            _buildInfoRow(
              'Fecha de registro',
              '${registrationDate.day.toString().padLeft(2, '0')}/${registrationDate.month.toString().padLeft(2, '0')}/${registrationDate.year}',
              Icons.event,
            ),
          if (rating != null)
            _buildInfoRow(
              'Calificación promedio',
              rating.toStringAsFixed(1),
              Icons.star_rate_rounded,
            ),
        ],
      ),
    );
  }

  Widget _buildCategories(Provider provider) {
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
            'Categorías',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppConstants.textDarkColor,
            ),
          ),
          const SizedBox(height: 12),
          if (provider.categories.isEmpty)
            Text(
              'Este proveedor no tiene categorías registradas.',
              style: TextStyle(color: AppConstants.textLightColor),
            )
          else
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: provider.categories
                  .map(
                    (category) => Chip(
                      label: Text(category.name),
                      backgroundColor: AppConstants.secondaryColor.withOpacity(0.2),
                    ),
                  )
                  .toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppConstants.textLightColor),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppConstants.textDarkColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(color: AppConstants.textLightColor),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
