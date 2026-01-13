/**
 * Loader
 * ------
 * Simple loading spinner
 *
 * Props:
 * - size?: number (default: 40)
 */

const Loader = ({ size = 40 }) => {
    return (
        <div style={styles.container}>
            <div
                style={{
                    ...styles.spinner,
                    width: size,
                    height: size,
                }}
            />
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
    },
    spinner: {
        border: "4px solid #e5e7eb",
        borderTop: "4px solid #2563eb",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
};

export default Loader;
