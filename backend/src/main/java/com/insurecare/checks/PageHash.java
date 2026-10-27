package com.insurecare.checks;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.math.BigInteger;
import java.util.Arrays;

/**
 * 256-bit perceptual hash of a page: shrink to 64x64 grey pixels, take the 16x16 lowest frequencies of
 * its discrete cosine transform, and record which are above their median. This describes the page's
 * overall layout of ink, so re-saved, rescaled or lightly edited copies keep almost the same bits while
 * different pages (including different mostly-white documents) differ in about half of them.
 */
final class PageHash {

    static final int BITS = 256;
    private static final int N = 64;
    private static final int K = 16;
    private static final double[][] COS = new double[K][N];

    static {
        for (int u = 0; u < K; u++) for (int x = 0; x < N; x++) COS[u][x] = Math.cos((2 * x + 1) * u * Math.PI / (2 * N));
    }

    private PageHash() {
    }

    static String of(BufferedImage image) {
        BufferedImage grey = new BufferedImage(N, N, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = grey.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(image, 0, 0, N, N, null);
        g.dispose();

        double[][] px = new double[N][N];
        for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) px[y][x] = grey.getRaster().getSample(x, y, 0);

        // Separable 2-D DCT, keeping only the K x K lowest frequencies.
        double[][] rows = new double[N][K];
        for (int y = 0; y < N; y++) for (int u = 0; u < K; u++) {
            double s = 0;
            for (int x = 0; x < N; x++) s += px[y][x] * COS[u][x];
            rows[y][u] = s;
        }
        double[] coef = new double[K * K];
        for (int v = 0; v < K; v++) for (int u = 0; u < K; u++) {
            double s = 0;
            for (int y = 0; y < N; y++) s += rows[y][u] * COS[v][y];
            coef[v * K + u] = s;
        }

        double[] sorted = coef.clone();
        sorted[0] = Double.NEGATIVE_INFINITY; // the overall brightness says nothing about layout
        Arrays.sort(sorted);
        double median = (sorted[K * K / 2 - 1] + sorted[K * K / 2]) / 2;
        BigInteger bits = BigInteger.ZERO;
        for (int i = 0; i < K * K; i++) {
            bits = bits.shiftLeft(1);
            if (i > 0 && coef[i] > median) bits = bits.setBit(0);
        }
        return String.format("%064x", bits);
    }

    /** Number of differing bits, or {@link #BITS} if either hash is malformed. */
    static int distance(String a, String b) {
        if (a == null || b == null || a.length() != 64 || b.length() != 64) return BITS;
        return new BigInteger(a, 16).xor(new BigInteger(b, 16)).bitCount();
    }
}
