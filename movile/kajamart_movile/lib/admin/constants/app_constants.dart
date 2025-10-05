// lib/constants/app_constants.dart
import 'package:flutter/material.dart';

class AppConstants {
  // Colores principales
  static const Color primaryColor = Color(0xFF00C853); // Verde brillante principal
  static const Color secondaryColor = Color(0xFFE8F5E9); // Verde claro suave
  static const Color accentColor = Color(0xFFF5F5F5); // Gris muy claro
  static const Color textDarkColor = Color(0xFF1F1F1F); // Texto oscuro
  static const Color textLightColor = Color(0xFF616161); // Texto gris
  static const Color backgroundColor = Color(0xFFFFFFFF); // Fondo blanco

  // Configuración del tema
  static const String appTitle = 'Admin - Inventario';

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
