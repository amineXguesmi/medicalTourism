class MarketplaceTransport {
  const MarketplaceTransport({this.timeout = const Duration(seconds: 8)});

  final Duration timeout;

  Future<String> get(Uri uri) {
    throw UnsupportedError('HTTP transport is not available on this platform.');
  }

  Future<String> post(
    Uri uri, {
    required Object body,
    Map<String, String> headers = const {},
  }) {
    throw UnsupportedError('HTTP transport is not available on this platform.');
  }
}
