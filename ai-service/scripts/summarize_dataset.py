from pathlib import Path
import pandas as pd


def summarize_dataset() -> None:
    dataset_path = Path(__file__).resolve().parents[1] / "data" / "sample_voice_features.csv"
    frame = pd.read_csv(dataset_path)

    print("Rows:", len(frame))
    print("Columns:", ", ".join(frame.columns))
    print("Stress distribution:")
    print(frame["stress_label"].value_counts())


if __name__ == "__main__":
    summarize_dataset()