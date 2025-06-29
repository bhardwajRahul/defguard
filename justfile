# build release binary
build:
    cargo build --release

# remove test databases
drop-test-dbs:
    ./drop_test_dbs.sh

# move tag to current commit
move-tag TAG:
    # remove local tag
    git tag --delete {{TAG}}
    # remove tag from remote
    git push --delete origin {{TAG}}
    # make new tag
    git tag {{TAG}}
    # push commits to remote
    git push
    # push new tag to remote
    git push origin {{TAG}}

# format Rust project
format:
    cargo +nightly --locked fmt --all  # use nightly toolchain for better import handling

# lint Rust project
lint:
    cargo clippy --all-targets --all-features

# run all migrations
migrate:
    sqlx migrate run

# update sqlx query data
query-data:
    cargo sqlx prepare --workspace -- --all-targets --all --tests
