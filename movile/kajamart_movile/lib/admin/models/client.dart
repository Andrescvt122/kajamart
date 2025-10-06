// lib/models/client.dart
enum ClientStatus {
  activo,
  inactivo,
}

extension ClientStatusExtension on ClientStatus {
  String get displayName {
    switch (this) {
      case ClientStatus.activo:
        return 'Activo';
      case ClientStatus.inactivo:
        return 'Inactivo';
    }
  }

  int get colorValue {
    switch (this) {
      case ClientStatus.activo:
        return 0xff4CAF50; // Verde
      case ClientStatus.inactivo:
        return 0xffF44336; // Rojo
    }
  }
}

class Client {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String? address;
  final ClientStatus status;
  final DateTime? registrationDate;
  final double? totalSpent;
  final int? totalOrders;
  final String? imageUrl;
  final String? documentNumber;
  final String? documentType;

  const Client({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    this.address,
    required this.status,
    this.registrationDate,
    this.totalSpent,
    this.totalOrders,
    this.imageUrl,
    this.documentNumber,
    this.documentType,
  });

  String get fullName => '$firstName $lastName';

  @override
  String toString() => fullName;
}
