// lib/data/sample_providers.dart
import '../models/provider.dart';
import '../models/provider_category.dart';

class SampleProviders {
  static List<ProviderCategory> get sampleCategories => [
    const ProviderCategory(
      id: 'CAT001',
      name: 'Tecnología',
      description: 'Proveedores de equipos tecnológicos',
    ),
    const ProviderCategory(
      id: 'CAT002',
      name: 'Alimentos',
      description: 'Proveedores de productos alimenticios',
    ),
    const ProviderCategory(
      id: 'CAT003',
      name: 'Limpieza',
      description: 'Productos de limpieza e higiene',
    ),
    const ProviderCategory(
      id: 'CAT004',
      name: 'Oficina',
      description: 'Suministros de oficina',
    ),
    const ProviderCategory(
      id: 'CAT005',
      name: 'Industrial',
      description: 'Equipo y maquinaria industrial',
    ),
    const ProviderCategory(
      id: 'CAT006',
      name: 'Servicios',
      description: 'Servicios profesionales',
    ),
  ];

  static List<Provider> get sampleProviders => [
    Provider(
      nit: '900.123.456-1',
      name: 'TechSolutions Ltda',
      contactName: 'María González',
      phone: '300-123-4567',
      categories: [
        sampleCategories[0], // Tecnología
        sampleCategories[2], // Limpieza
        sampleCategories[3], // Oficina
      ],
      status: ProviderStatus.activo,
      email: 'contacto@techsolutions.com',
      address: 'Calle 123 #45-67, Bogotá',
      registrationDate: DateTime(2023, 3, 15),
      averageRating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
    ),
    Provider(
      nit: '800.987.654-2',
      name: 'Distribuidora El Buen Sabor',
      contactName: 'Carlos Rodríguez',
      phone: '310-987-6543',
      categories: [
        sampleCategories[1], // Alimentos
        sampleCategories[2], // Limpieza
      ],
      status: ProviderStatus.activo,
      email: 'ventas@buensabor.com',
      address: 'Av. Principal #89-12, Medellín',
      registrationDate: DateTime(2023, 5, 20),
      averageRating: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
    ),
    Provider(
      nit: '901.456.789-3',
      name: 'Industriales del Valle',
      contactName: 'Ana López',
      phone: '320-456-7890',
      categories: [
        sampleCategories[4], // Industrial
        sampleCategories[5], // Servicios
        sampleCategories[0], // Tecnología
      ],
      status: ProviderStatus.inactivo,
      email: 'info@industrialesvalle.com',
      address: 'Zona Industrial, Cali',
      registrationDate: DateTime(2022, 11, 8),
      averageRating: 3.8,
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop',
    ),
    Provider(
      nit: '802.345.678-4',
      name: 'Suministros Profesionales',
      contactName: 'Roberto Sánchez',
      phone: '311-345-6789',
      categories: [
        sampleCategories[3], // Oficina
        sampleCategories[5], // Servicios
      ],
      status: ProviderStatus.activo,
      email: 'contacto@suministrospro.com',
      address: 'Centro Empresarial, Barranquilla',
      registrationDate: DateTime(2023, 7, 12),
      averageRating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop',
    ),
    Provider(
      nit: '803.234.567-5',
      name: 'EcoLimpieza Natural',
      contactName: 'Lucía Martínez',
      phone: '312-234-5678',
      categories: [
        sampleCategories[2], // Limpieza
        sampleCategories[1], // Alimentos
      ],
      status: ProviderStatus.activo,
      email: 'hola@ecolimpieza.com',
      address: 'Sector Verde, Cartagena',
      registrationDate: DateTime(2023, 9, 3),
      averageRating: 4.3,
      imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=300&h=200&fit=crop',
    ),
  ];
}
