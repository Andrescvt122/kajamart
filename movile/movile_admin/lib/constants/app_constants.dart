// lib/constants/app_constants.dart
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class AppConstants {
  // Colores principales
  static const Color primaryColor = Color(0xFF00C853); // Verde principal (coincide con cliente)
  static const Color secondaryColor = Color(0xFFB9F6CA); // Verde claro complementario
  static const Color accentColor = Color(0xfff5f5f5); // Fondo neutro claro
  static const Color textDarkColor = Color(0xff343b45); // Texto oscuro
  static const Color textLightColor = Color(0xff626762); // Texto gris
  static const Color backgroundColor = Colors.white; // Fondo blanco

  // Configuración del tema
  static const String appTitle = 'Admin - Inventario';

  // Backend
  // Nota: localhost en Android emulador necesita 10.0.2.2
  //      localhost en iOS simulator sigue siendo localhost
  static String get apiBaseUrl {
    const String fallback = 'http://localhost:3000/kajamart/api';

    if (kIsWeb) return fallback;

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:3000/kajamart/api';
      default:
        return fallback;
    }
  }

  static String get productsEndpoint => '$apiBaseUrl/products';
  static String get productDetailsEndpoint => '$apiBaseUrl/detailsProducts';

  // Configuración de navegación
  static const int navigationItemCount = 6;

  // Categorías de productos
  static const List<String> productCategories = [
    'Lácteos',
    'Cereales',
    'Bebidas',
    'Carnes',
    'Frutas',
    'Verduras',
    'Panadería',
    'Enlatados',
    'Especias',
    'Otros',
  ];
}
