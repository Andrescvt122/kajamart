// lib/constants/app_constants.dart
import 'package:flutter/material.dart';

class AppConstants {
  // Colores principales
  static const Color primaryColor = Color(0xff4a6741); // Verde oscuro principal
  static const Color secondaryColor = Color(0xffb4debf); // Verde claro
  static const Color accentColor = Color(0xffe8e5dc); // Beige claro
  static const Color textDarkColor = Color(0xff343b45); // Texto oscuro
  static const Color textLightColor = Color(0xff626762); // Texto gris
  static const Color backgroundColor = Color(0xffe8e5dc); // Fondo beige

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
